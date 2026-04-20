import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownCircle, ArrowUpCircle, Repeat, Users, Plus, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import FormInput from '../components/FormInput';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

const TransactionPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Deposit');

  const [formData, setFormData] = useState({ amount: '', from_account_id: '', to_account_id: '', description: '' });
  const [payeeForm, setPayeeForm] = useState({ payee_name: '', payee_account_no: '', bank_name: 'NexusBank', ifsc_code: '' });

  const up = (key, val) => setFormData(p => ({...p, [key]: val}));

  // Reset amount and description when switching tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormData(p => ({ ...p, amount: '', description: '' }));
  };

  const fetchData = async () => {
    try {
      // For customers, use their customer ID directly
      if (user?.customerId) {
        const [accs, bens] = await Promise.all([
          axios.get(`http://localhost:5000/api/accounts/customer/${user.customerId}`),
          axios.get(`http://localhost:5000/api/beneficiaries/${user.customerId}`),
        ]);
        setAccounts(accs.data);
        setBeneficiaries(bens.data);
      } else if (user?.role !== 'customer') {
        // Admin/teller — fetch all accounts
        const resp = await axios.get('http://localhost:5000/api/customers');
        if (resp.data.length > 0) {
          const custId = resp.data[0].customer_id;
          const [accs, bens] = await Promise.all([
            axios.get(`http://localhost:5000/api/accounts/customer/${custId}`),
            axios.get(`http://localhost:5000/api/beneficiaries/${custId}`),
          ]);
          setAccounts(accs.data);
          setBeneficiaries(bens.data);
        }
      }
      const recent = await axios.get('http://localhost:5000/api/transactions/global/recent');
      setRecentTransactions(recent.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (activeTab === 'Deposit') {
      try {
        const orderResp = await axios.post('http://localhost:5000/api/payments/create-order', { amount: formData.amount });
        const options = {
          key: 'rzp_test_SfPMCLlsyfOCxc',
          amount: orderResp.data.amount,
          currency: orderResp.data.currency,
          name: 'NexusBank',
          description: 'Secure Fund Deposit',
          order_id: orderResp.data.id,
          handler: async (response) => {
            try {
              const verifyResp = await axios.post('http://localhost:5000/api/payments/verify', {
                ...response, account_id: formData.to_account_id, amount: formData.amount
              });
              addToast(verifyResp.data.message || 'Deposit successful!', 'success');
              setFormData({ amount: '', from_account_id: '', to_account_id: '', description: '' });
              fetchData();
            } catch (err) { addToast('Payment verification failed: ' + (err.response?.data?.error || err.message), 'error'); }
          },
          theme: { color: '#2563EB' },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (r) => addToast('Payment failed: ' + r.error.description, 'error'));
        rzp.open();
      } catch (err) {
        addToast('Could not initiate payment: ' + (err.response?.data?.error || err.message), 'error');
      } finally { setLoading(false); }
    } else {
      try {
        await axios.post('http://localhost:5000/api/transactions', { ...formData, type: activeTab });
        addToast('Transaction successful!', 'success');
        setFormData({ ...formData, amount: '', description: '' });
        fetchData();
      } catch (err) {
        addToast('Transaction failed: ' + (err.response?.data?.error || err.message), 'error');
      } finally { setLoading(false); }
    }
  };

  const handleAddPayee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customerId = user?.customerId || (accounts.length > 0 ? accounts[0].customer_id : null);
      if (!customerId) throw new Error('No customer profile found.');
      await axios.post('http://localhost:5000/api/beneficiaries/add', { ...payeeForm, customer_id: customerId });
      addToast('Beneficiary added!', 'success');
      setPayeeForm({ payee_name: '', payee_account_no: '', bank_name: 'NexusBank', ifsc_code: '' });
      fetchData();
    } catch (err) {
      addToast('Failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally { setLoading(false); }
  };

  const TABS = ['Deposit', 'Withdrawal', 'Transfer', 'Payees'];
  const tabIcons = { Deposit: <ArrowDownCircle size={14} />, Withdrawal: <ArrowUpCircle size={14} />, Transfer: <Repeat size={14} />, Payees: <Users size={14} /> };

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Hub" subtitle="Manage deposits, transfers, and payees." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: FORM */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-card">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-4 pt-4 gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => switchTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                {tabIcons[tab]} {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'Payees' ? (
              <form onSubmit={handleAddPayee} className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Add new beneficiary</h3>
                <FormInput label="Payee name" placeholder="Full name" required value={payeeForm.payee_name} onChange={e => setPayeeForm({...payeeForm, payee_name: e.target.value})} />
                <FormInput label="Account number" type="number" placeholder="e.g. 10005001" required value={payeeForm.payee_account_no} onChange={e => setPayeeForm({...payeeForm, payee_account_no: e.target.value})} />
                <FormInput label="IFSC code" placeholder="e.g. NEXB0001234" value={payeeForm.ifsc_code} onChange={e => setPayeeForm({...payeeForm, ifsc_code: e.target.value})} />
                <Button type="submit" loading={loading} className="w-full" size="lg">Register payee</Button>
              </form>
            ) : (
              <form onSubmit={handleTransaction} className="space-y-4">
                {activeTab !== 'Deposit' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Source account</label>
                    <select required value={formData.from_account_id} onChange={e => up('from_account_id', e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                      <option value="">Select your account</option>
                      {accounts.map(a => <option key={a.account_id} value={a.account_id}>Acc 1000{5000 + a.account_id} — {formatINR(a.balance)}</option>)}
                    </select>
                  </div>
                )}

                {activeTab === 'Deposit' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Deposit to account</label>
                    <select required value={formData.to_account_id} onChange={e => up('to_account_id', e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                      <option value="">Select account</option>
                      {accounts.map(a => <option key={a.account_id} value={a.account_id}>Acc 1000{5000 + a.account_id} — {formatINR(a.balance)}</option>)}
                    </select>
                  </div>
                )}

                {activeTab === 'Transfer' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Beneficiary</label>
                    <select required value={formData.to_account_id} onChange={e => up('to_account_id', e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                      <option value="">Select payee</option>
                      {beneficiaries.map(b => <option key={b.id} value={b.payee_account_no}>{b.payee_name} (Acc: {b.payee_account_no})</option>)}
                    </select>
                  </div>
                )}

                {/* Quick amounts for Deposit and Withdrawal */}
                {(activeTab === 'Deposit' || activeTab === 'Withdrawal') && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Quick amount</label>
                    <div className="flex gap-2 flex-wrap">
                      {QUICK_AMOUNTS.map(amt => (
                        <button key={amt} type="button" onClick={() => up('amount', String(amt))}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition ${formData.amount == amt ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          ₹{amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <FormInput label="Amount (₹)" type="number" placeholder="0.00" prefix="₹" required min="1"
                  value={formData.amount} onChange={e => up('amount', e.target.value)} />
                <FormInput label="Note (optional)" placeholder="e.g. Monthly rent" value={formData.description} onChange={e => up('description', e.target.value)} />

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  {activeTab === 'Deposit' ? 'Pay via Razorpay →' : `Execute ${activeTab}`}
                </Button>

                {activeTab === 'Deposit' && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="text-xs text-slate-400">🔒 256-bit encrypted · Powered by Razorpay</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* RIGHT: SIDE INFO */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              {activeTab === 'Payees' ? 'My beneficiaries' : 'Recent activity'}
            </h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {activeTab === 'Payees' ? (
              beneficiaries.length > 0 ? beneficiaries.map(b => (
                <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Users size={14} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{b.payee_name}</p>
                    <p className="text-xs text-slate-400">Acc: {b.payee_account_no} · {b.bank_name}</p>
                  </div>
                </div>
              )) : <p className="px-5 py-8 text-sm text-slate-400 text-center">No beneficiaries added yet</p>
            ) : (
              recentTransactions.length > 0 ? recentTransactions.slice(0, 8).map(t => (
                <div key={t.transaction_id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === 'Deposit' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      {t.type === 'Deposit' ? <ArrowDownCircle size={12} className="text-emerald-600" /> : <ArrowUpCircle size={12} className="text-red-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{t.type}</p>
                      <p className="text-xs text-slate-400">{new Date(t.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${t.type === 'Deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'Deposit' ? '+' : '-'}₹{parseFloat(t.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              )) : <p className="px-5 py-8 text-sm text-slate-400 text-center">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
