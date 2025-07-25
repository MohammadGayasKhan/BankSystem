import React from 'react';
import { Link } from 'react-router-dom';

function CustomerNavbar() {
  return (
    <nav style={{ padding: '20px 40px' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '30px' }}>
        <li><Link to="/customer/make-payment">Make Payment</Link></li>
        <li><Link to="/customer/view-ledger">View Ledger</Link></li>
        <li><Link to="/customer/account-overview">Account Overview</Link></li>
      </ul>
    </nav>
  );
}

export default CustomerNavbar;