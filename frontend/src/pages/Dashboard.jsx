import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Landmark, CreditCard, TrendingUp, Users, ArrowDownCircle, ArrowUpCircle, Repeat,
  Eye, EyeOff, ArrowUpRight, ShieldAlert, Wifi, CheckCircle, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import { SkeletonCard } from '../components/SkeletonLoader';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const PIE_COLORS = { Deposit: '#2563EB', Withdrawal: '#DC2626', Transfer: '#8B5CF6' };

// --- Dashboard Sub-components ---

const VirtualCard = ({ card, accounts, hideBalance }) => {
  const linkedAcc = accounts.find(a => a.account_id === card.account_id);
  const cardGradient = (type, status) => {
    if (status === 'Blocked' || status === 'Frozen') return 'from-slate-700 to-slate-900';
    return type === 'Credit' ? 'from-purple-600 to-indigo-800' : 'from-blue-600 to-blue-800';
  };

  const maskCard = (num) => `•••• •••• •••• ${num.slice(-4)}`;

  return (
    <div className={`relative bg-gradient-to-br ${cardGradient(card.type, card.status)} rounded-xl p-5 text-white shadow-lg overflow-hidden h-44 flex flex-col justify-between`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest opacity-60">Virtual {card.type}</span>
          <span className="text-sm font-bold tracking-tight">NexusBank</span>
        </div>
        <Wifi size={16} className="opacity-40 rotate-90" />
      </div>
      
      <div className="text-lg font-mono tracking-[0.2em] py-2">
        {maskCard(card.card_number)}
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest opacity-60">Linked Balance</span>
          <span className="text-sm font-semibold">{hideBalance ? '₹ ****' : formatINR(linkedAcc?.balance || 0)}</span>
        </div>
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-red-500/80" />
          <div className="w-6 h-6 rounded-full bg-amber-400/80" />
        </div>
      </div>
    </div>
  );
};

const ProductSummary = ({ label, value, status, icon: Icon, color, onClick }) => (
  <button onClick={onClick} className="w-full bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:shadow-card transition group text-left">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${color}-50 text-${color}-600`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
    <div className="flex flex-col items-end gap-1">
      <StatusBadge status={(status || 'active').toLowerCase()} size="sm" />
      <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Details →</span>
    </div>
  </button>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [stats, setStats] = useState({ customers: 0, accounts: 0, totalDeposits: 0, branches: 0 });
  const [customerBalance, setCustomerBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [cards, setCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [fds, setFds] = useState([]);

  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin' || user?.role === 'teller';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isCustomer && user?.customerId) {
          const cid = user.customerId;
          const [accsResp, txResp, cardsResp, loansResp, fdsResp] = await Promise.all([
            axios.get(`http://localhost:5000/api/accounts/customer/${cid}`),
            axios.get(`http://localhost:5000/api/transactions/customer/${cid}/recent`),
            axios.get(`http://localhost:5000/api/cards/customer/${cid}`),
            axios.get(`http://localhost:5000/api/loans/customer/${cid}`),
            axios.get(`http://localhost:5000/api/fd/${cid}`),
          ]);
          setAccounts(accsResp.data);
          setCustomerBalance(accsResp.data.reduce((sum, a) => sum + parseFloat(a.balance), 0));
          setRecentTx(txResp.data.slice(0, 5));
          setCards(cardsResp.data);
          setLoans(loansResp.data);
          setFds(fdsResp.data);

          if (accsResp.data.length > 0) {
            const accId = accsResp.data[0].account_id;
            const [areaResp, pieResp] = await Promise.all([
              axios.get(`http://localhost:5000/api/analytics/spending/${accId}`),
              axios.get(`http://localhost:5000/api/analytics/distribution/${accId}`),
            ]);
            setChartData(areaResp.data);
            setPieData(pieResp.data);
          }
        } else if (isAdmin) {
          const [statsResp, txResp, approvalsResp] = await Promise.all([
            axios.get('http://localhost:5000/api/dashboard/stats'),
            axios.get('http://localhost:5000/api/transactions/global/recent'),
            axios.get('http://localhost:5000/api/admin/requests').catch(() => ({ data: [] })),
          ]);
          setStats(statsResp.data);
          setRecentTx(txResp.data.slice(0, 5));
          setPendingApprovals((approvalsResp.data || []).filter(r => r.status === 'Pending').slice(0, 3));
        }
      } finally { setLoading(false); }
    };
    load();
  }, [user]);

  const masked = (val) => hideBalance ? '₹ ****' : formatINR(val);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-card-md p-3">
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {formatINR(p.value)}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={isCustomer ? 'My Dashboard' : 'Admin Overview'} subtitle={isCustomer ? `Welcome back, ${user?.email?.split('@')[0]}` : 'System-wide banking operations'}>
        <button
          onClick={() => setHideBalance(!hideBalance)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-2 transition"
        >
          {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
          {hideBalance ? 'Show' : 'Hide'}
        </button>
      </PageHeader>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isCustomer ? (
          <>
            <StatCard label="Total Balance" value={masked(customerBalance)} icon={Landmark} colorScheme="blue" sub="All accounts combined" />
            <StatCard label="Active Accounts" value={hideBalance ? '*' : accounts.length} icon={CreditCard} colorScheme="green" sub="Savings & current" />
            <StatCard label="Primary Account" value={accounts[0] ? `****${String(accounts[0].account_id).padStart(4,'0')}` : 'N/A'} icon={CreditCard} colorScheme="amber" sub={accounts[0] ? masked(accounts[0].balance) : 'No account'} />
            <StatCard label="Recent Activity" value={recentTx.length} icon={ArrowUpRight} colorScheme="purple" sub="Transactions shown" />
          </>
        ) : (
          <>
            <StatCard label="Total customers" value={hideBalance ? '*' : stats.customers} icon={Users} colorScheme="blue" />
            <StatCard label="Total accounts" value={hideBalance ? '*' : stats.accounts} icon={CreditCard} colorScheme="green" />
            <StatCard label="Total deposits" value={masked(stats.totalDeposits)} icon={Landmark} colorScheme="purple" />
            <StatCard label="Bank branches" value={hideBalance ? '*' : stats.branches} icon={Landmark} colorScheme="amber" />
          </>
        )}
      </div>

      {/* CUSTOMER CHARTS */}
      {isCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Cash flow overview</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 6 months, income vs expenses</p>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#2563EB" strokeWidth={2} fill="url(#incomeFill)" dot={false} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#DC2626" strokeWidth={2} fill="url(#expenseFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Portfolio distribution</h3>
            {pieData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatINR(v)} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <p className="text-sm text-slate-400">No transaction data yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN APPROVALS */}
      {isAdmin && pendingApprovals.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Pending approvals</h3>
            <button onClick={() => navigate('/approvals')} className="text-xs text-primary-600 hover:underline">View all →</button>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingApprovals.map((req, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{req.customer_name || `Customer #${req.customer_id}`}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{req.request_type || req.type} · {formatDate(req.created_at || req.requested_at)}</p>
                </div>
                <StatusBadge status="pending" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER PRODUCTS SUMMARY */}
      {isCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Virtual Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">My Virtual Cards</h3>
              <button onClick={() => navigate('/cards')} className="text-xs text-primary-600 hover:underline">Manage cards →</button>
            </div>
            {cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.slice(0, 2).map(card => (
                  <VirtualCard key={card.id} card={card} accounts={accounts} hideBalance={hideBalance} />
                ))}
              </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-100 p-8 text-center border-dashed">
                  <CreditCard className="mx-auto text-slate-200 mb-3" size={32} />
                  <p className="text-sm text-slate-400">No active virtual cards</p>
                  <button onClick={() => navigate('/cards')} className="text-xs text-primary-600 mt-2 font-medium">Issue a new card →</button>
                </div>
            )}
          </div>

          {/* Active Products (Loans/FDs) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Active Products</h3>
            <div className="space-y-3">
              {loans.slice(0, 1).map(loan => (
                <ProductSummary key={loan.id} label="Personal Loan" value={formatINR(loan.principal || loan.amount)} status={loan.status} icon={TrendingUp} color="blue" onClick={() => navigate('/loans')} />
              ))}
              {fds.slice(0, 1).map(fd => (
                <ProductSummary key={fd.fd_id} label="Fixed Deposit" value={formatINR(fd.principal_amount)} status={fd.status || 'Active'} icon={Clock} color="emerald" onClick={() => navigate('/fd')} />
              ))}
              {loans.length === 0 && fds.length === 0 && (
                <div className="bg-slate-50 rounded-xl p-6 text-center">
                  <p className="text-xs text-slate-400 italic">No active loans or FDs found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Recent transactions</h3>
          <button onClick={() => navigate('/statement')} className="text-xs text-primary-600 hover:underline">View all →</button>
        </div>
        {recentTx.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {recentTx.map((t) => (
              <div key={t.transaction_id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'Deposit' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    {t.type === 'Deposit' ? <ArrowDownCircle size={14} className="text-emerald-600" /> : <ArrowUpCircle size={14} className="text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t.description || t.type}</p>
                    <p className="text-xs text-slate-400">{formatDate(t.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${t.type === 'Deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'Deposit' ? '+' : '-'}{formatINR(t.amount)}
                  </p>
                  <StatusBadge status="success" size="sm" label="Completed" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center gap-2">
            <Repeat size={28} className="text-slate-300" />
            <p className="text-sm text-slate-400">No transactions yet</p>
          </div>
        )}
      </div>

      {/* ADMIN Quick Actions */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Register customer', path: '/customers', color: 'text-blue-600 bg-blue-50' },
            { label: 'Open account', path: '/accounts', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Review approvals', path: '/approvals', color: 'text-amber-600 bg-amber-50' },
          ].map(({ label, path, color }) => (
            <button key={path} onClick={() => navigate(path)}
              className="bg-white rounded-xl border border-slate-100 p-5 text-left hover:shadow-card-md transition-shadow cursor-pointer group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <ArrowUpRight size={16} />
              </div>
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5 group-hover:text-primary-600 transition-colors">Click to navigate →</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
