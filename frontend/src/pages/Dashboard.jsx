import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [stats, setStats] = useState({
    customers: 0,
    accounts: 0,
    totalDeposits: 0,
    branches: 0
  });

  useEffect(() => {
    // In a real app, I'd fetch these from the backend
    setStats({
      customers: 3,
      accounts: 4,
      totalDeposits: '$10,450.00',
      branches: 3
    });
  }, []);

  return (
    <div className="dashboard-container">
      <section className="stats-grid">
        <StatCard title="Total Customers" value={stats.customers} icon={Users} color="#3b82f6" />
        <StatCard title="Active Accounts" value={stats.accounts} icon={CreditCard} color="#10b981" />
        <StatCard title="Total Deposits" value={stats.totalDeposits} icon={TrendingUp} color="#8b5cf6" />
        <StatCard title="Branches" value={stats.branches} icon={Landmark} color="#f59e0b" />
      </section>

      <section className="recent-activity glass">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="btn-primary">New Customer</button>
          <button className="btn-secondary">Open Account</button>
          <button className="btn-secondary">Transfer Funds</button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
