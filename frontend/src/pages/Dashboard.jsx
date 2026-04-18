import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Landmark, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const [stats, setStats] = useState({ customers: 0, accounts: 0, totalDeposits: 0, branches: 0 });
  const [customerBalance, setCustomerBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const resp = await axios.get('http://localhost:5000/api/dashboard/stats');
        setStats(resp.data);
      } catch (err) { console.error('Failed to fetch dashboard stats:', err); }
    };

    const fetchCustomerData = async () => {
      if(!user?.customerId) return;
      try {
        const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${user.customerId}`);
        let total = 0;
        let primaryAccId = null;
        if(accs.data.length > 0) {
            primaryAccId = accs.data[0].account_id;
            accs.data.forEach(a => total += parseFloat(a.balance));
        }
        setCustomerBalance(total);
        setStats(prev => ({...prev, accounts: accs.data.length}));

        if(primaryAccId) {
            const chartData = await axios.get(`http://localhost:5000/api/analytics/spending/${primaryAccId}`);
            setChartData(chartData.data);
        }
      } catch (err) { console.error('Failed to fetch customer data:', err); }
    };

    if (user?.role === 'customer') {
        fetchCustomerData();
    } else {
        fetchGlobalStats();
    }
  }, [user]);

  const formatCurrency = (val) => {
    if(hideBalance) return '₹ * * * *';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const isCustomer = user?.role === 'customer';

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>{isCustomer ? 'My Dashboard' : 'Global Admin Hub'}</h2>
          <button 
             onClick={() => setHideBalance(!hideBalance)} 
             style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '2rem', cursor: 'pointer', transition: 'all 0.2s'}}
             onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
             {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
             <span>{hideBalance ? 'Show Balances' : 'Hide Balances'}</span>
          </button>
      </div>

      <section className="stats-grid">
        {isCustomer ? (
            <>
                <StatCard title="Total Balance" value={formatCurrency(customerBalance)} icon={Landmark} color="#8b5cf6" />
                <StatCard title="Active Accounts" value={hideBalance ? '*' : stats.accounts} icon={CreditCard} color="#10b981" />
            </>
        ) : (
            <>
                <StatCard title="Total Customers" value={hideBalance ? '*' : stats.customers} icon={Users} color="#3b82f6" />
                <StatCard title="Active Accounts" value={hideBalance ? '*' : stats.accounts} icon={CreditCard} color="#10b981" />
                <StatCard title="Total Deposits" value={formatCurrency(stats.totalDeposits)} icon={TrendingUp} color="#8b5cf6" />
                <StatCard title="Branches" value={hideBalance ? '*' : stats.branches} icon={Landmark} color="#f59e0b" />
            </>
        )}
      </section>

      {isCustomer ? (
          <section className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Cashflow Analytics (Last 6 Months)</h3>
              <div style={{ width: '100%', height: 300 }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)'}}>
                        Not enough transaction data to build chart.
                    </div>
                )}
              </div>
          </section>
      ) : (
          <section className="recent-activity glass" style={{ marginTop: '2rem' }}>
            <h2>Quick Actions</h2>
            <div className="quick-actions">
            <button className="btn-primary" onClick={() => navigate('/customers')}>Register Customer</button>
            <button className="btn-secondary" onClick={() => navigate('/accounts')}>Open Account</button>
            <button className="btn-secondary" onClick={() => navigate('/transactions')}>Transfer Funds</button>
            </div>
          </section>
      )}
    </div>
  );
};

export default Dashboard;
