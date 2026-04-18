import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerPage from './pages/CustomerPage';
import AccountPage from './pages/AccountPage';
import TransactionPage from './pages/TransactionPage';
import StatementPage from './pages/StatementPage';
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
            <Route path="/customers" element={<PrivateRoute><Layout><CustomerPage /></Layout></PrivateRoute>} />
            <Route path="/accounts" element={<PrivateRoute><Layout><AccountPage /></Layout></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Layout><TransactionPage /></Layout></PrivateRoute>} />
            <Route path="/statement" element={<PrivateRoute><Layout><StatementPage /></Layout></PrivateRoute>} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
