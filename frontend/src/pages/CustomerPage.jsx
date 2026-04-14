import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Phone, Mail, MapPin } from 'lucide-react';
import '../styles/Pages.css';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', dob: ''
  });

  const fetchCustomers = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/customers');
      setCustomers(resp.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/customers', formData);
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', address: '', dob: '' });
      fetchCustomers();
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Customer Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={18} />
          {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showForm && (
        <form className="glass form-card" onSubmit={handleSubmit}>
          <h3>New Customer Registration</h3>
          <div className="form-grid">
            <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="date" placeholder="Date of Birth" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            <textarea className="full-width" placeholder="Home Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary">Register Customer</button>
        </form>
      )}

      <div className="customer-list grid">
        {customers.map(customer => (
          <div key={customer.customer_id} className="glass list-card">
            <div className="card-header">
              <h4>{customer.name}</h4>
              <span className="badge">ID: {customer.customer_id}</span>
            </div>
            <div className="card-body">
              <p><Mail size={14} /> {customer.email}</p>
              <p><Phone size={14} /> {customer.phone}</p>
              <p><MapPin size={14} /> {customer.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerPage;
