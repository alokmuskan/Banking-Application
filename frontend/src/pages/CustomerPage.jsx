import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search } from 'lucide-react';
import '../styles/Pages.css';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', dob: ''
  });

  const fetchData = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/customers');
      setCustomers(resp.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please provide a valid email address.");
      return false;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return false;
    }
    const dob = new Date(formData.dob);
    if (dob > new Date()) {
      alert("Date of Birth cannot be in the future.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post('http://localhost:5000/api/customers', formData);
      alert('Registration Successful!');
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', address: '', dob: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="title-group">
          <h2>Customer Management</h2>
          <p>Total Registered: {customers.length}</p>
        </div>
        <div className="header-actions">
          <div className="search-bar glass">
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Customer'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="glass form-card" onSubmit={handleSubmit}>
          <h3>Register New Customer</h3>
          <div className="form-grid">
            <input type="text" placeholder="Full Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="text" placeholder="Phone Number (10 digits)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="date" placeholder="Date of Birth *" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            <textarea className="full-width" placeholder="Permanent Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary">Complete Registration</button>
        </form>
      )}

      <div className="customer-grid grid">
        {filteredCustomers.map(cust => (
          <div key={cust.customer_id} className="glass list-card">
            <div className="card-header">
              <Users size={24} color="var(--accent)" />
              <span className="customer-id">CUST-{8000 + cust.customer_id}</span>
            </div>
            <div className="card-body">
              <h3>{cust.name}</h3>
              <p className="email">{cust.email}</p>
              <p className="phone">{cust.phone || 'No phone provided'}</p>
              <p className="currency">Currency: ₹</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerPage;
