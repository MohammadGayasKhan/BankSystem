import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CustomerOverview({ customerId: propCustomerId }) {
  const [customerId, setCustomerId] = useState(propCustomerId || '');
  const [overview, setOverview] = useState(null);
  const [inputId, setInputId] = useState('');

  useEffect(() => {
    if (customerId) {
      axios
        .get(`http://localhost:5000/api/v1/customers/${customerId}/overview`)
        .then((response) => setOverview(response.data))
        .catch((error) => {
          console.error('Error fetching overview:', error);
          alert('Failed to fetch customer overview');
        });
    }
  }, [customerId]);

  if (!propCustomerId && !customerId) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Enter Customer ID to view account overview</h2>
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          required
        />
        <button
          style={{ marginLeft: '10px' }}
          onClick={() => setCustomerId(inputId)}
        >
          View Overview
        </button>
      </div>
    );
  }

  if (propCustomerId && !customerId) {
    return <p>Please login as customer first.</p>;
  }

  return (
    <div>
      <h2>Account Overview</h2>
      {overview && (
        <div>
          <h3>Customer: {overview.customer_id}</h3>
          <p>Total Loans: {overview.total_loans}</p>
          {overview.loans.length > 0 ? (
            <div>
              <h4>Loan Details</h4>
              {overview.loans.map((loan) => (
                <div
                  key={loan.loan_id}
                  style={{
                    marginBottom: '20px',
                    border: '1px solid #ccc',
                    padding: '10px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      padding: '5px 10px',
                      background:
                        loan.status === 'CLOSED' ? '#4CAF50' : '#f39c12',
                      color: 'white',
                      borderRadius: '5px',
                    }}
                  >
                    {loan.status === 'CLOSED' ? 'Closed' : 'Active'}
                  </span>
                  <p>Loan ID: {loan.loan_id}</p>
                  <p>Principal: {loan.principal}</p>
                  <p>Total Amount: {loan.total_amount}</p>
                  <p>Total Interest: {loan.total_interest}</p>
                  <p>
                    EMI Amount: {loan.emi_amount} <b>(EMI/month)</b>
                  </p>
                  <p>Amount Paid: {loan.amount_paid}</p>
                  <p>Amount to be Paid: {loan.total_amount - loan.amount_paid}</p>
                  <p>EMIs Left: {loan.emis_left}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No loans found for this customer</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerOverview;