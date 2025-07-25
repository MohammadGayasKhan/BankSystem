import React, { useState } from 'react';
import axios from 'axios';

function MakePayment() {
  const [formData, setFormData] = useState({
    loan_id: '',
    amount: '',
    payment_type: 'EMI',
    emi_amount: null
  });
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(null);

  // Fetch EMI amount when loan_id changes
  const fetchEmiAmount = async (loan_id) => {
    if (!loan_id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/loans/${loan_id}/ledger`);
      setFormData((prev) => ({
        ...prev,
        emi_amount: res.data.monthly_emi,
        amount: res.data.monthly_emi // default for EMI
      }));
      setRemaining(res.data.balance_amount); // Saving remaining balance
    } catch {
      setFormData((prev) => ({
        ...prev,
        emi_amount: null,
        amount: ''
      }));
      setRemaining(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'loan_id') {
      fetchEmiAmount(value);
    }
    if (name === 'payment_type' && value === 'EMI' && formData.emi_amount) {
      setFormData((prev) => ({
        ...prev,
        amount: prev.emi_amount
      }));
    }
    if (name === 'payment_type' && value === 'LUMP_SUM') {
      setFormData((prev) => ({
        ...prev,
        amount: ''
      }));
    }
  };

  const handleClearAll = () => {
    if (remaining !== null) {
      setFormData((prev) => ({
        ...prev,
        amount: Number(remaining) 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.payment_type === 'LUMP_SUM' && parseFloat(formData.amount) < parseFloat(formData.emi_amount)) {
      alert('Lump sum payment must be at least equal to monthly EMI.');
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/loans/${formData.loan_id}/payments`,
        {
          amount: parseFloat(formData.amount),
          payment_type: formData.payment_type
        }
      );
      setResult(response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        alert(error.response.data.error);
      } else {
        alert('Failed to record payment');
      }
      setResult(null);
    }
  };

  return (
    <div>
      <h2>Make Payment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Loan ID:</label>
          <input
            type="text"
            name="loan_id"
            value={formData.loan_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Payment Mode:</label>
          <select
            name="payment_type"
            value={formData.payment_type}
            onChange={handleChange}
          >
            <option value="EMI">EMI</option>
            <option value="LUMP_SUM">Lump Sum</option>
          </select>
        </div>
        {formData.payment_type === 'EMI' && (
          <div>
            <label>Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.emi_amount || ''}
              disabled
            />
          </div>
        )}
        {formData.payment_type === 'LUMP_SUM' && (
          <div>
            <label>Amount:</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <button type="button" style={{ marginLeft: '10px' }} onClick={handleClearAll}>
              Clear All
            </button>
          </div>
        )}
        <button type="submit">Make Payment</button>
      </form>

      {result && (
        <div>
          <h3>Payment Recorded Successfully</h3>
          <p>Remaining Balance: {result.remaining_balance}</p>
          <p>EMIs Left: {result.emis_left}</p>
        </div>
      )}
    </div>
  );
}

export default MakePayment;