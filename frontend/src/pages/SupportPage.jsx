import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MapPin, Phone, Clock, Headset } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import FormInput from '../components/FormInput';

const SupportPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ subject: '', category: 'Account Issue', description: '' });
  const up = (k, v) => setForm(p => ({...p, [k]: v}));

  const fetchData = async () => {
    try {
      const [branchResp] = await Promise.all([
        axios.get('http://localhost:5000/api/branches'),
      ]);
      setBranches(branchResp.data);
      if (user?.customerId) {
        const txResp = await axios.get(`http://localhost:5000/api/support/tickets/${user.customerId}`).catch(() => ({ data: [] }));
        setTickets(txResp.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.customerId) return addToast('No customer profile found.', 'error');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/support/tickets', { ...form, customer_id: user.customerId });
      addToast('Support ticket submitted!', 'success');
      setShowForm(false);
      setForm({ subject: '', category: 'Account Issue', description: '' });
      fetchData();
    } catch (err) { addToast('Failed: ' + (err.response?.data?.error || err.message), 'error'); }
    finally { setLoading(false); }
  };

  const CATEGORIES = ['Account Issue', 'Dispute', 'Lost Card', 'Other'];

  return (
    <div className="space-y-6">
      <PageHeader title="Support center" subtitle="Get help with your banking needs.">
        {user?.role === 'customer' && (
          <Button icon={Plus} onClick={() => setShowForm(!showForm)} variant={showForm ? 'outlined' : 'primary'}>
            {showForm ? 'Cancel' : 'New ticket'}
          </Button>
        )}
      </PageHeader>

      {/* NEW TICKET FORM */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Submit a support request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Subject *" placeholder="Brief description" required value={form.subject} onChange={e => up('subject', e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select value={form.category} onChange={e => up('category', e.target.value)}
                  className="h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Description *</label>
              <textarea required rows={4} placeholder="Describe your issue in detail..."  value={form.description} onChange={e => up('description', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none" />
            </div>
            <Button type="submit" loading={loading}>Submit ticket</Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TICKETS */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">My tickets</h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {tickets.length > 0 ? tickets.map(t => (
              <div key={t.id} onClick={() => setSelectedTicket(selectedTicket?.id === t.id ? null : t)}
                className={`px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTicket?.id === t.id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{t.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.category} · {new Date(t.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
                  </div>
                  <StatusBadge status={(t.status || 'open').toLowerCase()} size="sm" />
                </div>
                {selectedTicket?.id === t.id && (
                  <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-blue-100">{t.description}</p>
                )}
              </div>
            )) : (
              <div className="flex flex-col items-center py-12 gap-2">
                <Headset size={28} className="text-slate-200" />
                <p className="text-sm text-slate-400">No tickets filed yet</p>
              </div>
            )}
          </div>
        </div>

        {/* BRANCHES */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Branch locator</h3>
          <div className="grid grid-cols-1 gap-3">
            {branches.map(b => (
              <div key={b.branch_id} className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{b.branch_name}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                      <MapPin size={11} />
                      <span>{b.address}, {b.city}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">Open</span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={11} />Mon–Sat, 9am–5pm</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
