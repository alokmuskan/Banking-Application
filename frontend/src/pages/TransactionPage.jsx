import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownCircle, ArrowUpCircle, Repeat } from 'lucide-react';
import '../styles/Pages.css';

const TransactionPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Deposit', amount: '', from_account_id: '', to_account_id: '', description: ''
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const resp = await axios.get('http://localhost:5000/api/customers');
        if(resp.data.length > 0) {
           const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${resp.data[0].customer_id}`);
           setAccounts(accs.data);
        }
      } catch (err) { console.error(err); }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/transactions', formData);
      alert('Transaction Successful!');
      setFormData({ ...formData, amount: '', description: '' });
    } catch (err) {
      alert('Transaction Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Financial Hub</h2>
        <p>Deposit, Withdraw or Transfer money securely.</p>
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
                  <option value="">Select Account</option>
                  {accounts.map(a => <option key={a.account_id} value={a.account_id}>Acc: {1000+a.account_id} (${a.balance})</option>)}
                </select>
              </div>
            )}

            {formData.type !== 'Withdrawal' && (
              <div className="input-group">
                <label>{formData.type === 'Transfer' ? 'Destination Account' : 'Target Account'}</label>
                <input type="number" placeholder="Enter Account ID" value={formData.to_account_id} onChange={e => setFormData({...formData, to_account_id: e.target.value})} required/>
              </div>
            )}

            <div className="input-group">
              <label>Amount</label>
              <input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required min="1" />
            </div>

            <div className="input-group">
              <label>Description (Optional)</label>
              <input type="text" placeholder="e.g. Rent Payment" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'Processing...' : `Confirm ${formData.type}`}
            </button>
          </div>
        </form>

        <div className="side-info glass">
          <h3>Security Tip</h3>
          <p>Always double-check the recipient's Account ID before confirming a transfer. Transactions are irreversible once processed.</p>
          <div className="limit-info">
            <span>Daily Limit: $50,000</span>
            <span>Fee: $0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
