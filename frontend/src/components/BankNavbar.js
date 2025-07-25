import React from 'react';
import { Link } from 'react-router-dom';

function BankNavbar() {
  return (
    <nav style={{ padding: '20px 40px' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '30px' }}>
        <li><Link to="/bank/create-loan">Create Loan</Link></li>
        <li><Link to="/bank/view-ledger">View Ledger</Link></li>
        <li><Link to="/bank/account-overview">Account Overview</Link></li>
      </ul>
    </nav>
  );
}

export default BankNavbar;