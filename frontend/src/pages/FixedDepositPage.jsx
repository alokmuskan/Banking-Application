import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Calendar, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import FormInput from '../components/FormInput';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

const FD_PLANS = [
  { months: 6,  rate: 5.5,  label: '6 months',  rateLabel: '5.5% p.a.' },
  { months: 12, rate: 7.0,  label: '1 year',    rateLabel: '7.0% p.a.' },
  { months: 36, rate: 7.5,  label: '3 years',   rateLabel: '7.5% p.a.' },
  { months: 60, rate: 8.5,  label: '5 years',   rateLabel: '8.5% p.a.' },
];

const FixedDepositPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [fds, setFds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    linked_account_id: '',
    principal_amount: '',
    duration_months: '12',
    interest_rate: '7.0',
  });

  const selectedPlan = FD_PLANS.find(p => p.months === parseInt(form.duration_months)) || FD_PLANS[1];

  const fetchData = async () => {
    try {
      let custId = user?.customerId;

      // If customerId not in JWT, look up by email
      if (!custId && user?.email) {
        const custResp = await axios.get('http://localhost:5000/api/customers');
        const me = custResp.data.find(c => c.email === user.email);
        if (me) custId = me.customer_id;
      }

      if (!custId) return;

      const [accsResp, fdResp] = await Promise.all([
        axios.get(`http://localhost:5000/api/accounts/customer/${custId}`),
        axios.get(`http://localhost:5000/api/fd/${custId}`),
      ]);
      setAccounts(accsResp.data);
      setFds(fdResp.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const calculateMaturity = () => {
    const P = parseFloat(form.principal_amount) || 0;
    const R = parseFloat(form.interest_rate) / 100;
    const T = parseFloat(form.duration_months) / 12;
    return P * Math.pow((1 + R / 4), 4 * T);
  };

  const interest = calculateMaturity() - (parseFloat(form.principal_amount) || 0);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.linked_account_id) { addToast('Please select a source account', 'error'); return; }
    setLoading(true);
    try {
      let custId = user?.customerId;
      if (!custId && user?.email) {
        const custResp = await axios.get('http://localhost:5000/api/customers');
        const me = custResp.data.find(c => c.email === user.email);
        if (me) custId = me.customer_id;
      }
      if (!custId) { addToast('Customer profile not found', 'error'); return; }
      await axios.post('http://localhost:5000/api/fd/book', { ...form, customer_id: custId });
      addToast('Fixed deposit booked successfully!', 'success');
      setForm(p => ({ ...p, principal_amount: '', linked_account_id: '' }));
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to book FD', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Fixed deposits" subtitle="Grow your savings with secured term deposits." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-100 shadow-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Open new fixed deposit</h3>

          <form onSubmit={handleBook} className="space-y-4">
            {/* Account selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Source account</label>
              <select required value={form.linked_account_id} onChange={e => setForm(p => ({...p, linked_account_id: e.target.value}))}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                <option value="">Select account</option>
                {accounts.map(a => (
                  <option key={a.account_id} value={a.account_id}>
                    Acc 1000{5000 + a.account_id} — {formatINR(a.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan selector */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Investment plan</label>
              <div className="grid grid-cols-2 gap-2">
                {FD_PLANS.map(p => (
                  <button key={p.months} type="button" onClick={() => setForm(prev => ({...prev, duration_months: String(p.months), interest_rate: String(p.rate)}))}
                    className={`p-3 rounded-lg border text-left transition ${form.duration_months == p.months ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <p className={`text-sm font-semibold ${form.duration_months == p.months ? 'text-primary-700' : 'text-slate-800'}`}>{p.label}</p>
                    <p className={`text-xs ${form.duration_months == p.months ? 'text-primary-500' : 'text-slate-400'}`}>{p.rateLabel}</p>
                  </button>
                ))}
              </div>
            </div>

            <FormInput label="Principal amount (₹)" type="number" prefix="₹" required min="1000" placeholder="Minimum ₹1,000"
              value={form.principal_amount} onChange={e => setForm(p => ({...p, principal_amount: e.target.value}))} />

            {/* Estimate card */}
            {parseFloat(form.principal_amount) > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Principal</span>
                  <span className="font-medium text-slate-900">{formatINR(form.principal_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Interest earned</span>
                  <span className="font-medium text-emerald-600">+{formatINR(interest)}</span>
                </div>
                <div className="h-px bg-emerald-200 my-1" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-900">Maturity amount</span>
                  <span className="font-bold text-emerald-700">{formatINR(calculateMaturity())}</span>
                </div>
                <p className="text-xs text-slate-400">Compounding quarterly · {selectedPlan.rateLabel}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Book fixed deposit →
            </Button>
          </form>
        </div>

        {/* FD LIST */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Active fixed deposits</h3>
          </div>
          {fds.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['FD ID', 'Principal', 'Rate', 'Tenure', 'Maturity date', 'Maturity amount', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fds.map(fd => (
                  <tr key={fd.fd_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">FD-{7000 + fd.fd_id}</td>
                    <td className="px-5 py-3 text-slate-700">{formatINR(fd.principal_amount)}</td>
                    <td className="px-5 py-3">
                      <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">{fd.interest_rate}%</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{fd.duration_months} mo.</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar size={12} />
                        {new Date(fd.maturity_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">{formatINR(fd.maturity_amount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={(fd.status || 'active').toLowerCase()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <TrendingUp size={32} className="text-slate-200" />
              <p className="text-sm text-slate-400">No fixed deposits yet. Open your first FD to start earning!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixedDepositPage;
