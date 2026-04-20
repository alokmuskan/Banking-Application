import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Mail, Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

const CustomerPage = () => {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dob: '', gender: '', occupation: '', annual_income: '', nationality: 'Indian',
    perm_village: '', perm_district: '', perm_city: '', perm_state: '', perm_pincode: '',
    temp_village: '', temp_district: '', temp_city: '', temp_state: '', temp_pincode: '',
    kyc_document_type: '', kyc_document_no: ''
  });

  const up = (key, val) => setFormData(p => ({...p, [key]: val}));

  const fetchData = async () => {
    const resp = await axios.get('http://localhost:5000/api/customers');
    setCustomers(resp.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/customers', formData);
      addToast('Customer registered successfully!', 'success');
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', dob: '', gender: '', occupation: '', annual_income: '', nationality: 'Indian', perm_village: '', perm_district: '', perm_city: '', perm_state: '', perm_pincode: '', temp_village: '', temp_district: '', temp_city: '', temp_state: '', temp_pincode: '', kyc_document_type: '', kyc_document_no: '' });
      fetchData();
    } catch (err) { addToast('Error: ' + (err.response?.data?.error || err.message), 'error'); }
    finally { setLoading(false); }
  };

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  const SectionTitle = ({ title }) => <h4 className="text-xs font-semibold text-primary-600 uppercase tracking-wide pt-4 pb-2 border-t border-slate-100">{title}</h4>;

  const SelectField = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select value={value} onChange={onChange} className="h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer management" subtitle={`${customers.length} total customers registered`}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="h-9 pl-9 pr-4 w-52 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
        </div>
        <Button icon={Plus} onClick={() => setShowForm(!showForm)} variant={showForm ? 'outlined' : 'primary'}>
          {showForm ? 'Cancel' : 'Add customer'}
        </Button>
      </PageHeader>

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Register new customer</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            <SectionTitle title="Personal details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput label="Full name *" placeholder="e.g. Ananya Sharma" required value={formData.name} onChange={e => up('name', e.target.value)} />
              <FormInput label="Email address *" type="email" required placeholder="email@example.com" value={formData.email} onChange={e => up('email', e.target.value)} />
              <FormInput label="Phone number" placeholder="10-digit number" value={formData.phone} onChange={e => up('phone', e.target.value)} />
              <FormInput label="Date of birth *" type="date" required value={formData.dob} onChange={e => up('dob', e.target.value)} />
              <SelectField label="Gender" value={formData.gender} onChange={e => up('gender', e.target.value)} options={[['', '— Select —'], ['Male', 'Male'], ['Female', 'Female'], ['Other', 'Other']]} />
              <FormInput label="Nationality" placeholder="Indian" value={formData.nationality} onChange={e => up('nationality', e.target.value)} />
            </div>

            <SectionTitle title="Employment & KYC" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormInput label="Occupation" placeholder="e.g. Software Engineer" value={formData.occupation} onChange={e => up('occupation', e.target.value)} />
              <FormInput label="Annual income (₹)" type="number" prefix="₹" placeholder="e.g. 1200000" value={formData.annual_income} onChange={e => up('annual_income', e.target.value)} />
              <SelectField label="KYC document type" value={formData.kyc_document_type} onChange={e => up('kyc_document_type', e.target.value)} options={[['', '— Select —'], ['Aadhaar', 'Aadhaar Card'], ['PAN', 'PAN Card'], ['Passport', 'Passport'], ['Voter ID', 'Voter ID']]} />
              <FormInput label="Document number" placeholder="Document ID" value={formData.kyc_document_no} onChange={e => up('kyc_document_no', e.target.value)} />
            </div>

            <SectionTitle title="Permanent address" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <FormInput label="Village / area" placeholder="Area / locality" value={formData.perm_village} onChange={e => up('perm_village', e.target.value)} />
              <FormInput label="City" placeholder="City" value={formData.perm_city} onChange={e => up('perm_city', e.target.value)} />
              <FormInput label="District" placeholder="District" value={formData.perm_district} onChange={e => up('perm_district', e.target.value)} />
              <FormInput label="State" placeholder="State" value={formData.perm_state} onChange={e => up('perm_state', e.target.value)} />
              <FormInput label="Pincode" placeholder="6-digit" value={formData.perm_pincode} onChange={e => up('perm_pincode', e.target.value)} />
            </div>

            <div className="pt-2">
              <button type="button" onClick={() => setFormData(p => ({ ...p, temp_village: p.perm_village, temp_city: p.perm_city, temp_district: p.perm_district, temp_state: p.perm_state, temp_pincode: p.perm_pincode }))}
                className="text-xs text-primary-600 hover:underline">
                Copy permanent address to temporary →
              </button>
            </div>

            <SectionTitle title="Temporary address" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <FormInput label="Village / area" placeholder="Area / locality" value={formData.temp_village} onChange={e => up('temp_village', e.target.value)} />
              <FormInput label="City" placeholder="City" value={formData.temp_city} onChange={e => up('temp_city', e.target.value)} />
              <FormInput label="District" placeholder="District" value={formData.temp_district} onChange={e => up('temp_district', e.target.value)} />
              <FormInput label="State" placeholder="State" value={formData.temp_state} onChange={e => up('temp_state', e.target.value)} />
              <FormInput label="Pincode" placeholder="6-digit" value={formData.temp_pincode} onChange={e => up('temp_pincode', e.target.value)} />
            </div>

            <div className="pt-4">
              <Button type="submit" loading={loading} size="lg">Complete registration</Button>
            </div>
          </form>
        </div>
      )}

      {/* Customer grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <div key={c.customer_id} className="bg-white rounded-xl border border-slate-100 shadow-card p-5 hover:shadow-card-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary-700">{c.name?.slice(0, 2).toUpperCase() || 'NA'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                <p className="text-xs text-slate-400">CUST-{8000 + c.customer_id}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={11} /><span className="truncate">{c.email}</span></div>
              {c.phone && <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={11} />{c.phone}</div>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-16 gap-3">
            <Users size={32} className="text-slate-200" />
            <p className="text-sm text-slate-400">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPage;
