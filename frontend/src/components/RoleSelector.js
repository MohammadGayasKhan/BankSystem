import React from 'react';
import { useNavigate } from 'react-router-dom';

function RoleSelector() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    if (role === 'bank') {
      navigate('/bank');
    } else {
      navigate('/customer');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <h1>Who are you?</h1>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => handleSelect('bank')}>Bank</button>
        <button onClick={() => handleSelect('customer')} style={{ marginLeft: '20px' }}>
          Customer
        </button>
      </div>
    </div>
  );
}

export default RoleSelector;
