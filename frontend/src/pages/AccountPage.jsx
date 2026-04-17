import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, Landmark, UserPlus } from 'lucide-react';
import '../styles/Pages.css';

const AccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '', 
    branch_id: '', 
    account_type: 'Savings', 
    initial_balance: '0',
    // New Customer fields
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: ''
  });

  const fetchData = async () => {
    try {
      const respAcc = await axios.get('http://localhost:5000/api/customers');
      const respBranch = await axios.get('http://localhost:5000/api/branches');
      setCustomers(respAcc.data);
      setBranches(respBranch.data);
      
      // Fetch some sample accounts (e.g. for the first customer in list)
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
      let finalCustomerId = formData.customer_id;

      // If it's a new customer, register them first
      if (isNewCustomer) {
        const custResp = await axios.post('http://localhost:5000/api/customers', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          dob: formData.dob
        });
        finalCustomerId = custResp.data.id;
      }

      // Now create the account
      await axios.post('http://localhost:5000/api/accounts', {
        customer_id: finalCustomerId,
        branch_id: formData.branch_id,
        account_type: formData.account_type,
        initial_balance: formData.initial_balance
      });

      alert('Account opened successfully!');
      setShowForm(false);
      setIsNewCustomer(false);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Account Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Open New Account'}
        </button>
      </div>

      {showForm && (
        <form className="glass form-card" onSubmit={handleSubmit}>
          <div className="form-toggle-header">
            <h3>Open a New Bank Account</h3>
            <button type="button" 
              className={`toggle-btn ${isNewCustomer ? 'active' : ''}`}
              onClick={() => setIsNewCustomer(!isNewCustomer)}
            >
              <UserPlus size={16} /> {isNewCustomer ? "Use Existing Customer" : "Register New Customer"}
            </button>
          </div>

          <div className="form-grid">
            {isNewCustomer ? (
              <>
                <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input type="date" placeholder="DOB" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                <textarea className="full-width" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </>
            ) : (
              <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                <option value="">Select Existing Customer</option>
                {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} (ID: {c.customer_id})</option>)}
              </select>
            )}
            
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
              <span className="account-no">Acc No: {5000 + acc.account_id}</span>
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
