import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownCircle, ArrowUpCircle, Repeat, History, Search, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/Pages.css';

const TransactionPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Deposit'); // Deposit, Withdrawal, Transfer, Payees

  const [formData, setFormData] = useState({
    amount: '', from_account_id: '', to_account_id: '', description: ''
  });

  const [payeeForm, setPayeeForm] = useState({
    payee_name: '', payee_account_no: '', bank_name: 'NexusBank', ifsc_code: ''
  });

  const fetchData = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/customers');
      
      const currentCustomer = user?.role === 'customer' && user.customerId 
          ? resp.data.find(c => c.customer_id === user.customerId)
          : resp.data[0];

      if(currentCustomer) {
         const custId = currentCustomer.customer_id;
         
         const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${custId}`);
         setAccounts(accs.data);

         const bens = await axios.get(`http://localhost:5000/api/beneficiaries/${custId}`);
         setBeneficiaries(bens.data);
      }
      
      const recent = await axios.get('http://localhost:5000/api/transactions/global/recent');
      setRecentTransactions(recent.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredTransactions = formData.from_account_id || formData.to_account_id
    ? recentTransactions.filter(t => 
        t.from_account_id == formData.from_account_id || 
        t.to_account_id == formData.to_account_id ||
        t.from_account_id == formData.to_account_id ||
        t.to_account_id == formData.from_account_id
      )
    : recentTransactions;

  const handleTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/transactions', {
          ...formData, type: activeTab
      });
      addToast('Transaction Successful!', 'success');
      setFormData({ ...formData, amount: '', description: '' });
      fetchData();
    } catch (err) {
      addToast('Transaction Failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customerId = user?.customerId || (accounts.length > 0 ? accounts[0].customer_id : null);
      if(!customerId) throw new Error("No customer profile found.");

      await axios.post('http://localhost:5000/api/beneficiaries/add', {
          ...payeeForm, customer_id: customerId
      });
      addToast('Beneficiary Added!', 'success');
      setPayeeForm({ payee_name: '', payee_account_no: '', bank_name: 'NexusBank', ifsc_code: '' });
      fetchData();
    } catch (err) {
      addToast('Failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Financial Hub</h2>
        <p>Manage payees and execute secure transactions.</p>
      </div>

      <div className="transaction-hub-grid">
        <div className="glass form-card transaction-form">
          <div className="type-selector" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <button type="button" className={activeTab === 'Deposit' ? 'active' : ''} onClick={() => setActiveTab('Deposit')}>
              <ArrowDownCircle size={16} /> Deposit
            </button>
            <button type="button" className={activeTab === 'Withdrawal' ? 'active' : ''} onClick={() => setActiveTab('Withdrawal')}>
              <ArrowUpCircle size={16} /> Withdraw
            </button>
            <button type="button" className={activeTab === 'Transfer' ? 'active' : ''} onClick={() => setActiveTab('Transfer')}>
              <Repeat size={16} /> Transfer
            </button>
            <button type="button" className={activeTab === 'Payees' ? 'active' : ''} onClick={() => setActiveTab('Payees')}>
              <Users size={16} /> Payees
            </button>
          </div>

          <div className="form-main">
            {activeTab === 'Payees' ? (
                <form onSubmit={handleAddPayee}>
                    <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Add New Beneficiary</h3>
                    <div className="input-group">
                        <label>Payee Name</label>
                        <input type="text" placeholder="Full Name" required value={payeeForm.payee_name} onChange={e => setPayeeForm({...payeeForm, payee_name: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Account Number</label>
                        <input type="number" placeholder="e.g. 10005001" required value={payeeForm.payee_account_no} onChange={e => setPayeeForm({...payeeForm, payee_account_no: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>IFSC Code</label>
                        <input type="text" placeholder="e.g. NEXB0001234" value={payeeForm.ifsc_code} onChange={e => setPayeeForm({...payeeForm, ifsc_code: e.target.value})} />
                    </div>
                    <button type="submit" className="btn-primary full-width" disabled={loading} style={{marginTop: '1rem'}}>
                        {loading ? 'Adding...' : 'Register Payee'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleTransaction}>
                    {activeTab !== 'Deposit' && (
                    <div className="input-group">
                        <label>Source Account</label>
                        <select required value={formData.from_account_id} onChange={e => setFormData({...formData, from_account_id: e.target.value})}>
                        <option value="">Select Your Account</option>
                        {accounts.map(a => <option key={a.account_id} value={a.account_id}>Acc: 1000{5000+a.account_id} [₹{parseFloat(a.balance).toLocaleString('en-IN')}]</option>)}
                        </select>
                    </div>
                    )}

                    {activeTab === 'Deposit' && (
                    <div className="input-group">
                        <label>Target Account</label>
                        <select required value={formData.to_account_id} onChange={e => setFormData({...formData, to_account_id: e.target.value})}>
                        <option value="">Select Your Account</option>
                        {accounts.map(a => <option key={a.account_id} value={a.account_id}>Acc: 1000{5000+a.account_id} [₹{parseFloat(a.balance).toLocaleString('en-IN')}]</option>)}
                        </select>
                    </div>
                    )}

                    {activeTab === 'Transfer' && (
                    <div className="input-group">
                        <label>Select Beneficiary</label>
                        <select required value={formData.to_account_id} onChange={e => setFormData({...formData, to_account_id: e.target.value})}>
                        <option value="">Select Registered Payee</option>
                        {beneficiaries.map(b => <option key={b.id} value={b.payee_account_no}>{b.payee_name} (Acc: {b.payee_account_no})</option>)}
                        </select>
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

                    <button type="submit" className="btn-primary full-width" disabled={loading} style={{marginTop: '1rem'}}>
                    {loading ? 'Processing...' : `Execute ${activeTab}`}
                    </button>
                </form>
            )}
          </div>
        </div>

        <div className="side-info glass">
          <div className="card-header">
            <h3>{activeTab === 'Payees' ? 'My Beneficiaries' : 'Recent Activity'}</h3>
            {activeTab === 'Payees' ? <Users size={18} color="var(--text-secondary)" /> : <History size={18} color="var(--text-secondary)" />}
          </div>
          
          <div className="activity-list">
            {activeTab === 'Payees' ? (
                // Display Beneficiaries
                beneficiaries.length > 0 ? beneficiaries.map(b => (
                    <div key={b.id} className="activity-item">
                        <div className="activity-icon">
                            <Users size={14} color="var(--accent)" />
                        </div>
                        <div className="activity-details">
                            <span className="activity-type">{b.payee_name}</span>
                            <span className="activity-amount" style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Acc: {b.payee_account_no}</span>
                            <span className="activity-date">{b.bank_name} {b.ifsc_code ? `| IFSC: ${b.ifsc_code}` : ''}</span>
                        </div>
                    </div>
                )) : <p className="no-data">No beneficiaries added yet.</p>
            ) : (
                // Display Transactions
                filteredTransactions.length > 0 ? filteredTransactions.map(t => (
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
                )
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
