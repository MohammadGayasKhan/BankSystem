import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CustomerLogin({ setCustomerId }) {
  const [inputId, setInputId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputId) return;
    try {
      await axios.get(`http://localhost:5000/api/v1/customers/${inputId}/overview`);
      setCustomerId(inputId);
      navigate('/customer/account-overview');
    } catch {
      try {
        await axios.post('http://localhost:5000/api/v1/customers', { customer_id: inputId, name: inputId });
        setCustomerId(inputId);
        navigate('/customer/account-overview');
      } catch {
        setError('Failed to create customer');
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Enter Customer ID</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          required
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Continue</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CustomerLogin;