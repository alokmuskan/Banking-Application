import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

const AccountPage = () => {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerMode, setCustomerMode] = useState('existing'); // 'existing' | 'new'
  const [formData, setFormData] = useState({
    customer_id: '', branch_id: '', account_type: 'Savings', initial_deposit: ''
  });

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/customers'),
      axios.get('http://localhost:5000/api/branches'),
      axios.get('http://localhost:5000/api/accounts'),
    ]).then(([c, b, a]) => { setCustomers(c.data); setBranches(b.data); setAccounts(a.data); })
    .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/accounts', formData);
      addToast('Account opened successfully!', 'success');
      setFormData({ customer_id: '', branch_id: '', account_type: 'Savings', initial_deposit: '' });
      const resp = await axios.get('http://localhost:5000/api/accounts');
      setAccounts(resp.data);
    } catch (err) { addToast('Error: ' + (err.response?.data?.error || err.message), 'error'); }
    finally { setLoading(false); }
  };

  const sel = (key, val) => setFormData(p => ({...p, [key]: val}));

  return (
    <div className="space-y-6">
      <PageHeader title="Account management" subtitle={`${accounts.length} accounts open`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6 h-fit">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Open new account</h3>
          
          <div className="mb-6 flex items-center gap-6 pb-4 border-b border-slate-100">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input type="radio" name="customerMode" checked={customerMode === 'existing'} onChange={() => setCustomerMode('existing')} className="text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" />
              Existing customer
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input type="radio" name="customerMode" checked={customerMode === 'new'} onChange={() => setCustomerMode('new')} className="text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" />
              New customer
            </label>
          </div>

          {customerMode === 'existing' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Select Customer *</label>
                <select required value={formData.customer_id} onChange={e => sel('customer_id', e.target.value)}
                  className="h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                  <option value="">— Select customer —</option>
                  {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Account type *</label>
              <select required value={formData.account_type} onChange={e => sel('account_type', e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                {['Savings', 'Checking', 'Joint', 'Business', 'FD'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Branch</label>
              <select value={formData.branch_id} onChange={e => sel('branch_id', e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                <option value="">— No branch —</option>
                {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name} — {b.city}</option>)}
              </select>
            </div>
              <FormInput label="Initial deposit (₹)" type="number" prefix="₹" min="0" placeholder="0.00"
                value={formData.initial_deposit} onChange={e => sel('initial_deposit', e.target.value)} />
              <Button type="submit" loading={loading} className="w-full" size="lg">Open account</Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 border-dashed rounded-lg text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Landmark className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">KYC Registration required</p>
                <p className="text-xs text-slate-500">New customers must complete their profile and KYC before an account can be opened.</p>
              </div>
              <Link to="/customers" className="w-full">
                <Button variant="primary" className="w-full" icon={ArrowRight}>Register Customer</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Accounts list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">All accounts</h3>
          </div>
          {accounts.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Account ID', 'Customer', 'Type', 'Branch', 'Balance'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {accounts.map(a => (
                  <tr key={a.account_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-700">1000{5000 + a.account_id}</td>
                    <td className="px-5 py-3 text-slate-900 font-medium">{a.name || `Cust #${a.customer_id}`}</td>
                    <td className="px-5 py-3 text-slate-600">{a.account_type}</td>
                    <td className="px-5 py-3 text-slate-500">{a.branch_name || '—'}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">₹{parseFloat(a.balance || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Landmark size={32} className="text-slate-200" />
              <p className="text-sm text-slate-400">No accounts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
