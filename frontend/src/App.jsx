import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerPage from './pages/CustomerPage';
import AccountPage from './pages/AccountPage';
import TransactionPage from './pages/TransactionPage';
import StatementPage from './pages/StatementPage';
import CardsPage from './pages/CardsPage';
import LoansPage from './pages/LoansPage';
import SupportPage from './pages/SupportPage';
import ApprovalsPage from './pages/ApprovalsPage';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            
            <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/dashboard" element={<Navigate to="/" />} />
            <Route path="/customers" element={<PrivateRoute allowedRoles={['admin', 'teller']}><Layout><CustomerPage /></Layout></PrivateRoute>} />
            <Route path="/accounts" element={<PrivateRoute allowedRoles={['admin', 'teller']}><Layout><AccountPage /></Layout></PrivateRoute>} />
            <Route path="/approvals" element={<PrivateRoute allowedRoles={['admin', 'teller']}><Layout><ApprovalsPage /></Layout></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Layout><TransactionPage /></Layout></PrivateRoute>} />
            <Route path="/cards" element={<PrivateRoute><Layout><CardsPage /></Layout></PrivateRoute>} />
            <Route path="/loans" element={<PrivateRoute><Layout><LoansPage /></Layout></PrivateRoute>} />
            <Route path="/support" element={<PrivateRoute><Layout><SupportPage /></Layout></PrivateRoute>} />
            <Route path="/statement" element={<PrivateRoute><Layout><StatementPage /></Layout></PrivateRoute>} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
