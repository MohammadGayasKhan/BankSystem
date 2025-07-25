import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import RoleSelector from './components/RoleSelector';
import BankNavbar from './components/BankNavbar';
import CustomerNavbar from './components/CustomerNavbar';
import CreateLoan from './components/CreateLoan';
import MakePayment from './components/MakePayment';
import LoanLedger from './components/LoanLedger';
import CustomerOverview from './components/CustomerOverview';
import CustomerLogin from './components/CustomerLogin';
import './App.css';

function TopRightRoleButton() {
  const navigate = useNavigate();
  return (
    <button
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        padding: '8px 16px',
        background: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 1000
      }}
      onClick={() => navigate('/')}
    >
      Change Role
    </button>
  );
}

function App() {
  const [customerId, setCustomerId] = useState('');

  return (
    <Router>
      <div className="App">
        <TopRightRoleButton />
        <Routes>
          <Route path="/" element={<RoleSelector />} />
          <Route path="/bank/*" element={
            <div>
              <BankNavbar />
              <Routes>
                <Route index element={<CreateLoan />} /> 
                <Route path="create-loan" element={<CreateLoan />} />
                <Route path="view-ledger" element={<LoanLedger />} />
                <Route path="account-overview" element={<CustomerOverview />} />
              </Routes>
            </div>
          } />
          {/* Customer routes */}
          <Route path="/customer" element={<CustomerLogin setCustomerId={setCustomerId} />} />
          <Route path="/customer/*" element={
            customerId
              ? (
                <div>
                  <CustomerNavbar />
                  <Routes>
                    <Route path="make-payment" element={<MakePayment customerId={customerId} />} />
                    <Route path="view-ledger" element={<LoanLedger />} />
                    <Route path="account-overview" element={<CustomerOverview customerId={customerId} />} />
                  </Routes>
                </div>
              )
              : <CustomerLogin setCustomerId={setCustomerId} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;