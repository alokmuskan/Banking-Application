import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownCircle, ArrowUpCircle, Repeat, History, Search, TrendingUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/Pages.css';

const TransactionPage = () => {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Deposit', amount: '', from_account_id: '', to_account_id: '', description: ''
  });

  const fetchData = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/customers');
      if(resp.data.length > 0) {
         const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${resp.data[0].customer_id}`);
         setAccounts(accs.data);
      }
      
      // Fetch global recent transactions
      const recent = await axios.get('http://localhost:5000/api/transactions/global/recent');
      setRecentTransactions(recent.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter local state for the currently selected account (if applicable)
  const filteredTransactions = formData.from_account_id || formData.to_account_id
    ? recentTransactions.filter(t => 
        t.from_account_id == formData.from_account_id || 
        t.to_account_id == formData.to_account_id ||
        t.from_account_id == formData.to_account_id ||
        t.to_account_id == formData.from_account_id
      )
    : recentTransactions;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/transactions', formData);
      addToast('Transaction Successful!', 'success');
      setFormData({ ...formData, amount: '', description: '' });
      fetchData();
    } catch (err) {
      addToast('Transaction Failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Financial Hub</h2>
        <p>Transfer money, deposit funds, or withdraw cash.</p>
      </div>

      <div className="transaction-hub-grid">
        <form className="glass form-card transaction-form" onSubmit={handleSubmit}>
          <div className="type-selector">
            <button type="button" className={formData.type === 'Deposit' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'Deposit'})}>
              <ArrowDownCircle size={18} /> Deposit
            </button>
            <button type="button" className={formData.type === 'Withdrawal' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'Withdrawal'})}>
              <ArrowUpCircle size={18} /> Withdraw
            </button>
            <button type="button" className={formData.type === 'Transfer' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'Transfer'})}>
              <Repeat size={18} /> Transfer
            </button>
          </div>

          <div className="form-main">
            {formData.type !== 'Deposit' && (
              <div className="input-group">
                <label>Source Account</label>
                <select required value={formData.from_account_id} onChange={e => setFormData({...formData, from_account_id: e.target.value})}>
                  <option value="">Select Your Account</option>
                  {accounts.map(a => <option key={a.account_id} value={a.account_id}>Acc: 1000{5000+a.account_id} [₹{parseFloat(a.balance).toLocaleString('en-IN')}]</option>)}
                </select>
              </div>
            )}

            {formData.type !== 'Withdrawal' && (
              <div className="input-group">
                <label>{formData.type === 'Transfer' ? 'Recipient Account ID' : 'Target Account'}</label>
                <input type="number" placeholder="Enter Account ID" value={formData.to_account_id} onChange={e => setFormData({...formData, to_account_id: e.target.value})} required/>
              </div>
            )}

            <div className="input-row">
              <div className="input-group">
                <label>Amount (₹)</label>
                <input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required min="1" />
              </div>
            </div>

            <div className="input-group">
              <label>Description</label>
              <input type="text" placeholder="e.g. Monthly Rent" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'Processing...' : `Execute ${formData.type}`}
            </button>
          </div>
        </form>

        <div className="side-info glass">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <History size={18} color="var(--text-secondary)" />
          </div>
          <div className="activity-list">
            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
              <div key={t.transaction_id} className="activity-item">
                <div className="activity-icon">
                   {t.type === 'Deposit' ? <ArrowDownCircle size={14} color="var(--success)" /> : <TrendingUp size={14} color="var(--danger)" />}
                </div>
                <div className="activity-details">
                   <span className="activity-type">{t.type}</span>
                   <span className="activity-amount">₹{parseFloat(t.amount).toLocaleString('en-IN')}</span>
                   <span className="activity-date">{new Date(t.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            )) : (
              <p className="no-data">No recent transactions for this account selection.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
