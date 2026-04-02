import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Landmark, TrendingUp } from 'lucide-react';
import '../styles/Dashboard.css';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card glass">
    <div className="stat-info">
      <span className="stat-title">{title}</span>
      <span className="stat-value">{value}</span>
    </div>
    <div className="stat-icon" style={{ background: color }}>
      <Icon size={24} color="white" />
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    customers: 0,
    accounts: 0,
    totalDeposits: 0,
    branches: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await axios.get('http://localhost:5000/api/dashboard/stats');
        setStats(resp.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <div className="dashboard-container">
      <section className="stats-grid">
        <StatCard title="Total Customers" value={stats.customers} icon={Users} color="#3b82f6" />
        <StatCard title="Active Accounts" value={stats.accounts} icon={CreditCard} color="#10b981" />
        <StatCard title="Total Deposits" value={formatCurrency(stats.totalDeposits)} icon={TrendingUp} color="#8b5cf6" />
        <StatCard title="Branches" value={stats.branches} icon={Landmark} color="#f59e0b" />
      </section>

      <section className="recent-activity glass">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="btn-primary" onClick={() => navigate('/customers')}>Register Customer</button>
          <button className="btn-secondary" onClick={() => navigate('/accounts')}>Open Account</button>
          <button className="btn-secondary" onClick={() => navigate('/transactions')}>Transfer Funds</button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
