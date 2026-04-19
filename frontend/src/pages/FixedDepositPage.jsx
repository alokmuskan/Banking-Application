import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Landmark, TrendingUp, Calendar, ArrowRightCircle } from 'lucide-react';
import '../styles/Pages.css';

const FixedDepositPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [fds, setFds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);

  const [formData, setFormData] = useState({
    linked_account_id: '',
    principal_amount: '',
    duration_months: '12',
    interest_rate: '7.0'
  });

  const fdPlans = [
    { months: 6, rate: 5.5, label: "6 Months (5.5%)" },
    { months: 12, rate: 7.0, label: "1 Year (7.0%)" },
    { months: 36, rate: 7.5, label: "3 Years (7.5%)" },
    { months: 60, rate: 8.5, label: "5 Years (8.5%)" },
  ];

  const fetchData = async () => {
    if (!user?.customerId) return;
    try {
      const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${user.customerId}`);
      setAccounts(accs.data);
      
      const fdData = await axios.get(`http://localhost:5000/api/fd/${user.customerId}`);
      setFds(fdData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePlanChange = (e) => {
    const selected = fdPlans.find(p => p.months === parseInt(e.target.value));
    setFormData({ ...formData, duration_months: selected.months, interest_rate: selected.rate });
  };

  const handleBookFD = async (e) => {
    e.preventDefault();
    setLoading(true);

    if(!formData.linked_account_id) {
        addToast('Please select a source account', 'error');
        setLoading(false);
        return;
    }

    try {
      await axios.post('http://localhost:5000/api/fd/book', {
        ...formData,
        customer_id: user.customerId
      });
      addToast('Fixed Deposit booked successfully! The amount has been deducted.', 'success');
      setFormData({ ...formData, principal_amount: '' });
      fetchData(); // Refresh balances and FD list
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to book FD', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Math simulation for display
  const calculateEstimate = () => {
      const P = parseFloat(formData.principal_amount) || 0;
      const R = parseFloat(formData.interest_rate) / 100;
      const T = parseFloat(formData.duration_months) / 12;
      const A = P * Math.pow((1 + R/4), 4 * T);
      return Math.floor(A);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="title-group">
          <h2>Fixed Deposits (FD)</h2>
          <p>Secure your future with high-yield locked term deposits.</p>
        </div>
      </div>

      <div className="transaction-hub-grid">
        <div className="form-card glass">
          <h3 style={{marginBottom: '1.5rem'}}>Open New FD</h3>
          <form onSubmit={handleBookFD}>
            <div className="input-group">
              <label>Source Account (For Principal Deduction)</label>
              <select required value={formData.linked_account_id} onChange={e => setFormData({...formData, linked_account_id: e.target.value})}>
                <option value="">Select Account</option>
                {accounts.map(a => (
                    <option key={a.account_id} value={a.account_id}>
                        Acc: 1000{5000 + a.account_id} [Bal: ₹{parseFloat(a.balance).toLocaleString('en-IN')}]
                    </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Investment Plan (Tenure & Rate)</label>
              <select required value={formData.duration_months} onChange={handlePlanChange}>
                {fdPlans.map(p => (
                    <option key={p.months} value={p.months}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Principal Amount (₹)</label>
              <input type="number" required min="1000" placeholder="Minimum ₹1000" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} />
            </div>

            <div className="summary-box" style={{background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '1rem', marginTop: '1.5rem', border: '1px solid var(--border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>
                    <span>Compounding:</span>
                    <span>Quarterly</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem'}}>
                    <span>Maturity Estimate:</span>
                    <span style={{color: 'var(--accent)'}}>₹{calculateEstimate().toLocaleString('en-IN')}</span>
                </div>
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading} style={{marginTop: '1.5rem'}}>
              {loading ? 'Processing...' : 'Book Fixed Deposit'}
            </button>

          </form>
        </div>

        <div className="side-info glass">
            <div className="card-header">
                <h3>My Active FDs</h3>
                <TrendingUp size={20} color="var(--accent)" />
            </div>
            
            <div className="activity-list" style={{marginTop: '1rem'}}>
                {fds.length > 0 ? fds.map(fd => (
                    <div key={fd.fd_id} className="activity-item" style={{background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                        <div className="activity-details" style={{width: '100%'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                <span style={{fontWeight: 'bold'}}>FD-{7000 + fd.fd_id}</span>
                                <span style={{background: 'var(--accent)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem'}}>
                                    {fd.interest_rate}% p.a.
                                </span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                                <span>Principal: ₹{parseFloat(fd.principal_amount).toLocaleString('en-IN')}</span>
                                <span>Maturity: ₹{parseFloat(fd.maturity_amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                <span style={{display:'flex', alignItems:'center', gap:'0.3rem'}}><Calendar size={14}/> {new Date(fd.start_date).toLocaleDateString()}</span>
                                <ArrowRightCircle size={14} />
                                <span style={{display:'flex', alignItems:'center', gap:'0.3rem', color: 'var(--success)'}}><Calendar size={14}/> {new Date(fd.maturity_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="no-data">No Fixed Deposits found.</p>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default FixedDepositPage;
