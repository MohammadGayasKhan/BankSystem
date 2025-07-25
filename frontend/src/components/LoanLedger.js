import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LoanLedger() {
  const [loanId, setLoanId] = useState('');
  const [ledger, setLedger] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/loans/${loanId}/ledger`
      );
      setLedger(response.data);
    } catch (error) {
      console.error('Error fetching ledger:', error);
      alert('Failed to fetch loan ledger');
    }
  };

  return (
    <div>
      <h2>View Loan Ledger</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Loan ID:</label>
          <input
            type="text"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            required
          />
        </div>
        <button type="submit">View Ledger</button>
      </form>

      {ledger && (
        <div>
          <h3>Loan Details</h3>
          <p>Principal: {ledger.principal}</p>
          <p>Total Amount: {ledger.total_amount}</p>
          <p>Monthly EMI: {ledger.monthly_emi}</p>
          <p>Amount Paid: {ledger.amount_paid}</p>
          <p>Balance Amount: {ledger.balance_amount}</p>
          <p>EMIs Left: {ledger.emis_left}</p>

          <h4>Transactions</h4>
          {ledger.transactions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {ledger.transactions.map((txn) => (
                  <tr key={txn.transaction_id}>
                    <td>{new Date(txn.date).toLocaleString()}</td>
                    <td>{txn.amount}</td>
                    <td>{txn.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default LoanLedger;