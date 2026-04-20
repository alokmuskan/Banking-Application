import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PiggyBank, Calculator, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import FormInput from '../components/FormInput';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

const LoansPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [calc, setCalc] = useState({ amount: 500000, rate: 8.5, tenure: 5 });

  const isCustomer = user?.role === 'customer';

  const monthlyEMI = () => {
    const P = calc.amount, r = calc.rate / 12 / 100, n = calc.tenure * 12;
    if (!r) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const emi = monthlyEMI();
  const totalPayment = emi * calc.tenure * 12;
  const totalInterest = totalPayment - calc.amount;

  const fetchCustomerLoans = async (targetCustomerId) => {
    try {
      const resp = await axios.get(`http://localhost:5000/api/loans/customer/${targetCustomerId}`);
      setLoans(resp.data);
    } catch { setLoans([]); }
  };

  useEffect(() => {
    if (isCustomer && user?.customerId) {
      fetchCustomerLoans(user.customerId);
    } else {
      axios.get('http://localhost:5000/api/customers').then(r => setCustomers(r.data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!isCustomer) {
      if (selectedCustomerId) fetchCustomerLoans(selectedCustomerId);
      else setLoans([]);
    }
  }, [selectedCustomerId]);

  const handleApply = async () => {
    const targetId = isCustomer ? user?.customerId : selectedCustomerId;
    if (!targetId) return addToast('Select a customer first', 'error');
    const status = isCustomer ? 'Pending' : 'Active';
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/loans/apply', {
        customer_id: targetId,
        loan_type: 'Personal Loan',
        amount: calc.amount,
        interest_rate: calc.rate,
        tenure_months: calc.tenure * 12,
        status,
      });
      addToast(`Loan ${status === 'Active' ? 'granted' : 'application submitted'}!`, 'success');
      fetchCustomerLoans(targetId);
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Loans center" subtitle={isCustomer ? 'Apply for loans and track your EMI.' : 'Manage loan origination.'} />

      {!isCustomer && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><Users size={16} className="text-primary-600" /> Select customer</h3>
          <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white w-full max-w-xs">
            <option value="">— Select customer —</option>
            {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.email})</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EMI Calculator */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-100 shadow-card p-6 space-y-5 h-fit">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Calculator size={16} className="text-primary-600" /> EMI calculator</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 flex justify-between mb-1">
                Loan amount <span className="text-primary-600 font-semibold">{formatINR(calc.amount)}</span>
              </label>
              <input type="range" min="10000" max="5000000" step="10000"
                value={calc.amount} onChange={e => setCalc(p => ({...p, amount: Number(e.target.value)}))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>₹10K</span><span>₹50L</span></div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 flex justify-between mb-1">
                Interest rate <span className="text-primary-600 font-semibold">{calc.rate}%</span>
              </label>
              <input type="range" min="6" max="20" step="0.5"
                value={calc.rate} onChange={e => setCalc(p => ({...p, rate: Number(e.target.value)}))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>6%</span><span>20%</span></div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 flex justify-between mb-1">
                Tenure <span className="text-primary-600 font-semibold">{calc.tenure} years</span>
              </label>
              <input type="range" min="1" max="20" step="1"
                value={calc.tenure} onChange={e => setCalc(p => ({...p, tenure: Number(e.target.value)}))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1 yr</span><span>20 yrs</span></div>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 space-y-3">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Monthly EMI</p>
              <p className="text-2xl font-bold text-primary-600">{formatINR(emi)}</p>
            </div>
            <div className="space-y-1 pt-2 border-t border-primary-100">
              {[
                ['Principal', formatINR(calc.amount), 'text-slate-900'],
                ['Total interest', formatINR(totalInterest), 'text-amber-600'],
                ['Total payment', formatINR(totalPayment), 'text-emerald-600 font-semibold'],
              ].map(([label, value, cls]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className={cls}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleApply} loading={loading} size="lg">
            {isCustomer ? 'Apply for this loan →' : 'Grant loan to customer →'}
          </Button>
        </div>

        {/* Active Loans */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Active loans</h3>
          </div>
          {loans.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {loans.map(loan => {
                const emiAmt = monthlyEMI();
                const paidPercent = Math.min(100, Math.round(10));
                return (
                  <div key={loan.loan_id} className="px-6 py-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{loan.loan_type}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Loan ID: L-{6000 + loan.loan_id}</p>
                      </div>
                      <StatusBadge status={(loan.status || 'active').toLowerCase()} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[
                        ['Amount', formatINR(loan.amount)],
                        ['Interest', `${loan.interest_rate}% p.a.`],
                        ['Tenure', `${loan.tenure_months} mo.`],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-sm font-semibold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Repayment progress</span>
                        <span>{paidPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 rounded-full" style={{ width: `${paidPercent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <PiggyBank size={32} className="text-slate-200" />
              <p className="text-sm text-slate-400">No active loans found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoansPage;
