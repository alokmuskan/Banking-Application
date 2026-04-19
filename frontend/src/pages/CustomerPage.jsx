import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/Pages.css';

const CustomerPage = () => {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dob: '', gender: '', occupation: '', annual_income: '', nationality: 'Indian',
    perm_village: '', perm_district: '', perm_city: '', perm_state: '', perm_pincode: '',
    temp_village: '', temp_district: '', temp_city: '', temp_state: '', temp_pincode: '',
    kyc_document_type: '', kyc_document_no: ''
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
      addToast("Please provide a valid email address.", "error");
      return false;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      addToast("Phone number must be exactly 10 digits.", "error");
      return false;
    }
    const dobDate = new Date(formData.dob);
    const birthYear = dobDate.getFullYear();
    const currentYear = new Date().getFullYear();
    
    if (dobDate > new Date() || birthYear < 1920 || birthYear > currentYear - 1) {
      addToast("Please enter a valid birth year (1920 - Present).", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post('http://localhost:5000/api/customers', formData);
      addToast('Registration Successful!', 'success');
      setShowForm(false);
      setFormData({ 
        name: '', email: '', phone: '', dob: '', gender: '', occupation: '', annual_income: '', nationality: 'Indian',
        perm_village: '', perm_district: '', perm_city: '', perm_state: '', perm_pincode: '',
        temp_village: '', temp_district: '', temp_city: '', temp_state: '', temp_pincode: '',
        kyc_document_type: '', kyc_document_no: ''
      });
      fetchData();
    } catch (err) {
      addToast('Error: ' + (err.response?.data?.error || err.message), 'error');
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
        <form className="glass form-card" onSubmit={handleSubmit} style={{maxWidth: '800px', margin: '0 auto'}}>
          <h3 style={{marginBottom: '1.5rem'}}>Register New Customer</h3>
          
          <h4 style={{color: 'var(--accent)', marginBottom: '1rem'}}>Personal Details</h4>
          <div className="form-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
            <input type="text" placeholder="Full Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="text" placeholder="Phone Number (10 digits)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="date" placeholder="Date of Birth *" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            <select className="form-control" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{background: 'var(--bg-tertiary)'}}>
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
            <input type="text" placeholder="Nationality (Default: Indian)" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
          </div>

          <h4 style={{color: 'var(--accent)', marginTop: '2rem', marginBottom: '1rem'}}>Employment & KYC</h4>
          <div className="form-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
            <input type="text" placeholder="Occupation (e.g. Engineer)" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
            <input type="number" placeholder="Annual Income (₹)" value={formData.annual_income} onChange={e => setFormData({...formData, annual_income: e.target.value})} />
            <select className="form-control" value={formData.kyc_document_type} onChange={e => setFormData({...formData, kyc_document_type: e.target.value})} style={{background: 'var(--bg-tertiary)'}}>
                <option value="">-- KYC Document Type --</option>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
            </select>
            <input type="text" placeholder="Document Number" value={formData.kyc_document_no} onChange={e => setFormData({...formData, kyc_document_no: e.target.value})} />
          </div>

          <h4 style={{color: 'var(--accent)', marginTop: '2rem', marginBottom: '1rem'}}>Permanent Address</h4>
          <div className="form-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'}}>
            <input type="text" placeholder="Village / Area" value={formData.perm_village} onChange={e => setFormData({...formData, perm_village: e.target.value})} />
            <input type="text" placeholder="City" value={formData.perm_city} onChange={e => setFormData({...formData, perm_city: e.target.value})} />
            <input type="text" placeholder="District" value={formData.perm_district} onChange={e => setFormData({...formData, perm_district: e.target.value})} />
            <input type="text" placeholder="State" value={formData.perm_state} onChange={e => setFormData({...formData, perm_state: e.target.value})} />
            <input type="text" placeholder="Pincode" value={formData.perm_pincode} onChange={e => setFormData({...formData, perm_pincode: e.target.value})} />
          </div>

          <button type="button" className="btn-secondary full-width" style={{marginTop: '1rem', marginBottom: '1rem'}} onClick={() => setFormData({
              ...formData, 
              temp_village: formData.perm_village, temp_city: formData.perm_city, 
              temp_district: formData.perm_district, temp_state: formData.perm_state, 
              temp_pincode: formData.perm_pincode
          })}>
              Copy Permanent to Temporary Address
          </button>

          <h4 style={{color: 'var(--accent)', marginBottom: '1rem'}}>Temporary Address</h4>
          <div className="form-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'}}>
            <input type="text" placeholder="Village / Area" value={formData.temp_village} onChange={e => setFormData({...formData, temp_village: e.target.value})} />
            <input type="text" placeholder="City" value={formData.temp_city} onChange={e => setFormData({...formData, temp_city: e.target.value})} />
            <input type="text" placeholder="District" value={formData.temp_district} onChange={e => setFormData({...formData, temp_district: e.target.value})} />
            <input type="text" placeholder="State" value={formData.temp_state} onChange={e => setFormData({...formData, temp_state: e.target.value})} />
            <input type="text" placeholder="Pincode" value={formData.temp_pincode} onChange={e => setFormData({...formData, temp_pincode: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary full-width" style={{marginTop: '2rem'}}>Complete Registration</button>
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
