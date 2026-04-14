import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, Landmark } from 'lucide-react';
import '../styles/Pages.css';

const AccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '', branch_id: '', account_type: 'Savings', initial_balance: '0'
  });

  const fetchData = async () => {
    try {
      const respAcc = await axios.get('http://localhost:5000/api/customers'); // Just to get list for dropdown
      const respBranch = await axios.get('http://localhost:5000/api/branches');
      setCustomers(respAcc.data);
      setBranches(respBranch.data);
      
      // Fetch some sample accounts
      if(respAcc.data.length > 0) {
        const respAllAcc = await axios.get(`http://localhost:5000/api/accounts/customer/${respAcc.data[0].customer_id}`);
        setAccounts(respAllAcc.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/accounts', formData);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Account Settings</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Open New Account'}
        </button>
      </div>

      {showForm && (
        <form className="glass form-card" onSubmit={handleSubmit}>
          <h3>Open a New Bank Account</h3>
          <div className="form-grid">
            <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name}</option>)}
            </select>
            <select required value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
            </select>
            <select value={formData.account_type} onChange={e => setFormData({...formData, account_type: e.target.value})}>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
            </select>
            <input type="number" placeholder="Initial Deposit" value={formData.initial_balance} onChange={e => setFormData({...formData, initial_balance: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary">Create Account</button>
        </form>
      )}

      <div className="account-list grid">
        {accounts.map(acc => (
          <div key={acc.account_id} className="glass list-card account-card">
            <div className="card-header">
              <Landmark size={24} color="var(--accent)" />
              <span className="account-no">Acc No: {1000 + acc.account_id}</span>
            </div>
            <div className="card-body">
              <span className="type-tag">{acc.account_type}</span>
              <h3 className="balance">${parseFloat(acc.balance).toLocaleString()}</h3>
              <p className="status">Status: {acc.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;
