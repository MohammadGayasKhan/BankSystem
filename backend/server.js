const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./bank.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the bank database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS loans (
    loan_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    principal_amount DECIMAL NOT NULL,
    total_amount DECIMAL NOT NULL,
    interest_rate DECIMAL NOT NULL,
    loan_period_years INTEGER NOT NULL,
    monthly_emi DECIMAL NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    payment_type TEXT NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans (loan_id)
  )`);
});

function calculateLoanDetails(principal, years, rate) {
  const interest = principal * years * (rate / 100);
  const totalAmount = principal + interest;
  const monthlyEmi = totalAmount / (years * 12);
  return { interest, totalAmount, monthlyEmi };
}


// LEND: Create a new loan
app.post('/api/v1/loans', (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;
  
  if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { interest, totalAmount, monthlyEmi } = calculateLoanDetails(
    loan_amount,
    loan_period_years,
    interest_rate_yearly
  );

  const loanId = uuidv4();

  db.run(
    `INSERT INTO loans (loan_id, customer_id, principal_amount, total_amount, interest_rate, loan_period_years, monthly_emi) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loanId, customer_id, loan_amount, totalAmount, interest_rate_yearly, loan_period_years, monthlyEmi],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        loan_id: loanId,
        customer_id,
        total_amount_payable: totalAmount,
        monthly_emi: monthlyEmi
      });
    }
  );
});

// PAYMENT: Record a payment
app.post('/api/v1/loans/:loan_id/payments', (req, res) => {
  const { loan_id } = req.params;
  const { amount, payment_type } = req.body;

  if (!amount || !payment_type || !['EMI', 'LUMP_SUM'].includes(payment_type)) {
    return res.status(400).json({ error: 'Invalid payment data.' });
  }

  db.get(`SELECT * FROM loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });

    if (loan.status === 'CLOSED') {
      return res.status(400).json({ error: 'This loan is already closed. No further payments allowed.' });
    }

    const amount_paid_query = `SELECT SUM(amount) as paid FROM payments WHERE loan_id = ?`;
    db.get(amount_paid_query, [loan_id], (err, paidRow) => {
      if (err) return res.status(500).json({ error: err.message });
      const total_paid = paidRow && paidRow.paid ? paidRow.paid : 0;
      const balance = loan.total_amount - total_paid;

      if (amount > balance) {
        return res.status(400).json({ error: 'Payment amount is more than required. Please pay only the remaining balance.' });
      }

      if (payment_type === 'EMI') {
        if (amount < loan.monthly_emi) {
          return res.status(400).json({ error: 'EMI payment must be at least equal to monthly EMI.' });
        }
        if (amount > loan.monthly_emi) {
          return res.status(400).json({ error: 'For payments greater than monthly EMI, please select LUMP_SUM payment type.' });
        }
      } else if (payment_type === 'LUMP_SUM') {
        if (amount < loan.monthly_emi) {
          return res.status(400).json({ error: 'Lump sum payment must be at least equal to monthly EMI.' });
        }
      }

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(
          `INSERT INTO payments (payment_id, loan_id, amount, payment_type) VALUES (?, ?, ?, ?)`,
          [uuidv4(), loan_id, amount, payment_type],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            // After payment, check if loan is fully paid
            const new_total_paid = total_paid + amount;
            const new_balance = loan.total_amount - new_total_paid;
            let new_status = loan.status;
            if (new_balance <= 0.01) { 
              new_status = 'CLOSED';
            }
            db.run(
              `UPDATE loans SET status = ? WHERE loan_id = ?`,
              [new_status, loan_id],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                db.run('COMMIT');
                getLoanDetails(loan_id, res);
              }
            );
          }
        );
      });
    });
  });
});

// LEDGER 
app.get('/api/v1/loans/:loan_id/ledger', (req, res) => {
  const { loan_id } = req.params;

  db.get(
    `SELECT l.*, 
            (SELECT SUM(amount) FROM payments WHERE loan_id = l.loan_id) as amount_paid
     FROM loans l
     WHERE l.loan_id = ?`,
    [loan_id],
    (err, loan) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      db.all(
        `SELECT payment_id as transaction_id, payment_date as date, amount, payment_type as type
         FROM payments
         WHERE loan_id = ?
         ORDER BY payment_date`,
        [loan_id],
        (err, transactions) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const balanceAmount = loan.total_amount - (loan.amount_paid || 0);
          const emisLeft = Math.ceil(balanceAmount / loan.monthly_emi);

          res.json({
            loan_id: loan.loan_id,
            customer_id: loan.customer_id,
            principal: loan.principal_amount,
            total_amount: loan.total_amount,
            monthly_emi: loan.monthly_emi,
            amount_paid: loan.amount_paid || 0,
            balance_amount: balanceAmount,
            emis_left: emisLeft,
            status: loan.status,
            transactions: transactions || []
          });
        }
      );
    }
  );
});

// ACCOUNT OVERVIEW 
app.get('/api/v1/customers/:customer_id/overview', (req, res) => {
  const { customer_id } = req.params;

  db.all(
    `SELECT l.loan_id, l.principal_amount as principal, l.total_amount, 
            l.total_amount - l.principal_amount as total_interest,
            l.monthly_emi as emi_amount,
            l.status,
            (SELECT SUM(amount) FROM payments WHERE loan_id = l.loan_id) as amount_paid,
            CEIL((l.total_amount - IFNULL((SELECT SUM(amount) FROM payments WHERE loan_id = l.loan_id), 0)) / l.monthly_emi) as emis_left
     FROM loans l
     WHERE l.customer_id = ?`,
    [customer_id],
    (err, loans) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        customer_id,
        total_loans: loans.length,
        loans: loans.map(loan => ({
          loan_id: loan.loan_id,
          principal: loan.principal,
          total_amount: loan.total_amount,
          total_interest: loan.total_interest,
          emi_amount: loan.emi_amount,
          amount_paid: loan.amount_paid || 0,
          emis_left: loan.emis_left,
          status: loan.status
        }))
      });
    }
  );
});

function getLoanDetails(loanId, res) {
  db.get(
    `SELECT l.*, 
            (SELECT SUM(amount) FROM payments WHERE loan_id = l.loan_id) as amount_paid
     FROM loans l
     WHERE l.loan_id = ?`,
    [loanId],
    (err, loan) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }
      // IMPORTANT **Always recalculate balance using latest payments
      const amountPaid = loan.amount_paid || 0;
      let balanceAmount = loan.total_amount - amountPaid;
      if (balanceAmount < 0) balanceAmount = 0;  
      const emisLeft = balanceAmount > 0 ? Math.ceil(balanceAmount / loan.monthly_emi) : 0;

      res.json({
        loan_id: loan.loan_id,
        customer_id: loan.customer_id,
        principal: loan.principal_amount,
        total_amount: loan.total_amount,
        monthly_emi: loan.monthly_emi,
        amount_paid: amountPaid,
        remaining_balance: balanceAmount,
        emis_left: emisLeft,
        status: loan.status
      });
    }
  );
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
