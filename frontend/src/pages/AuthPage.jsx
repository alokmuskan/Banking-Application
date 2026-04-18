import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Mail, Lock, User } from 'lucide-react';
import '../styles/Pages.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer for signup
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Login successful', 'success');
      } else {
        await register(email, password, role);
        addToast('Registration successful', 'success');
      }
      navigate('/dashboard'); // Using /dashboard as main entry
    } catch (err) {
      addToast(err.response?.data?.error || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <Shield size={48} color="var(--accent)" />
          <h2>{isLogin ? 'Secure Login' : 'Create Account'}</h2>
          <p>{isLogin ? 'Welcome back to the Banking System' : 'Join our modern banking platform'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group-auth">
            <Mail size={18} className="input-icon" color="var(--text-secondary)" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="input-group-auth">
            <Lock size={18} className="input-icon" color="var(--text-secondary)" />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {!isLogin && (
            <div className="input-group-auth">
              <User size={18} className="input-icon" color="var(--text-secondary)" />
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="customer">Customer</option>
                <option value="teller">Teller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit">
            {isLogin ? 'Log in' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="text-btn toggle-btn-auth" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
