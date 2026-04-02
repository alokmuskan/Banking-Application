import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, Landmark, UserPlus, Image, FileCheck } from 'lucide-react';
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

  const validateForm = () => {
    if (isNewCustomer) {
      if (!formData.name || !formData.email || !formData.dob) {
        alert("Please fill in all mandatory customer details.");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Invalid email format.");
        return false;
      }
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        alert("Phone number must be 10 digits.");
        return false;
      }
    } else if (!formData.customer_id) {
      alert("Please select an existing customer.");
      return false;
    }

    if (!formData.branch_id) {
      alert("Please select a branch.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let finalCustomerId = formData.customer_id;

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

      await axios.post('http://localhost:5000/api/accounts', {
        customer_id: finalCustomerId,
        branch_id: formData.branch_id,
        account_type: formData.account_type,
        initial_balance: formData.initial_balance
      });

      alert('Successfully processed! Your new Account is now active.');
      setShowForm(false);
      setIsNewCustomer(false);
      fetchData();
    } catch (err) {
      alert('Operation Failed: ' + (err.response?.data?.error || err.message));
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
                <input type="text" placeholder="Full Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="Phone (10 digits)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input type="date" placeholder="DOB *" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                <textarea className="full-width" placeholder="Permanent Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                
                {/* KYC Simulation Fields */}
                <div className="kyc-section full-width">
                  <p>KYC Documents (Optional)</p>
                  <div className="kyc-inputs">
                    <div className="file-input">
                      <label><Image size={16} /> Profile Photo</label>
                      <input type="file" accept="image/*" />
                    </div>
                    <div className="file-input">
                      <label><FileCheck size={16} /> ID Proof (Aadhar/PAN)</label>
                      <input type="file" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                <option value="">Select Existing Customer</option>
                {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} (CUST-{8000 + c.customer_id})</option>)}
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
            <input type="number" placeholder="Initial Deposit (₹)" value={formData.initial_balance} onChange={e => setFormData({...formData, initial_balance: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary">Create Account</button>
        </form>
      )}

      <div className="account-list grid">
        {accounts.map(acc => (
          <div key={acc.account_id} className="glass list-card account-card">
            <div className="card-header">
              <Landmark size={24} color="var(--accent)" />
              <span className="account-no">Acc No: 1000{5000 + acc.account_id}</span>
            </div>
            <div className="card-body">
              <span className="type-tag">{acc.account_type}</span>
              <h3 className="balance">₹{parseFloat(acc.balance).toLocaleString('en-IN')}</h3>
              <p className="status">Status: {acc.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountPage;
