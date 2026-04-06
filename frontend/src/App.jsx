import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerPage from './pages/CustomerPage';
import AccountPage from './pages/AccountPage';
import TransactionPage from './pages/TransactionPage';
import StatementPage from './pages/StatementPage';
import './styles/global.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/accounts" element={<AccountPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/statement" element={<StatementPage />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;
