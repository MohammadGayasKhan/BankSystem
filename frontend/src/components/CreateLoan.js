import React, { useState } from 'react';
import axios from 'axios';

function CreateLoan() {
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    loan_period_years: '',
    interest_rate_yearly: ''
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/v1/loans', {
        customer_id: formData.customer_id,
        loan_amount: parseFloat(formData.loan_amount),
        loan_period_years: parseInt(formData.loan_period_years),
        interest_rate_yearly: parseFloat(formData.interest_rate_yearly)
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Failed to create loan');
    }
  };

  return (
    <div>
      <h2>Create New Loan</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Customer ID:</label>
          <input
            type="text"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Loan Amount:</label>
          <input
            type="number"
            name="loan_amount"
            value={formData.loan_amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Loan Period (Years):</label>
          <input
            type="number"
            name="loan_period_years"
            value={formData.loan_period_years}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Interest Rate (%):</label>
          <input
            type="number"
            step="0.01"
            name="interest_rate_yearly"
            value={formData.interest_rate_yearly}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Loan</button>
      </form>

      {result && (
        <div>
          <h3>Loan Created Successfully</h3>
          <p>Loan ID: {result.loan_id}</p>
          <p>Total Amount Payable: {result.total_amount_payable}</p>
          <p>Monthly EMI: {result.monthly_emi}</p>
        </div>
      )}
    </div>
  );
}

export default CreateLoan;