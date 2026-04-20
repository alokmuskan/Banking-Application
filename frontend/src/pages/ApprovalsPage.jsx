import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const ApprovalsPage = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');

  const fetchData = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/admin/requests');
      setRequests(resp.data);
    } catch { }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, type, action) => {
    setLoading(`${id}-${action}`);
    try {
      await axios.put(`http://localhost:5000/api/admin/requests/${id}/status`, { status: action === 'approve' ? 'Active' : 'Rejected', type });
      addToast(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
      fetchData();
    } catch (err) { addToast(err.response?.data?.error || 'Action failed', 'error'); }
    finally { setLoading(''); }
  };

  const filtered = requests.filter(r => {
    const s = (r.status || '').toLowerCase();
    if (activeTab === 'Pending') return s === 'pending';
    if (activeTab === 'Approved') return s === 'active' || s === 'approved';
    if (activeTab === 'Rejected') return s === 'rejected';
    return true;
  });

  const pendingCount = requests.filter(r => (r.status || '').toLowerCase() === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" subtitle="Review and act on pending customer requests." />

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {['Pending', 'Approved', 'Rejected'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition flex items-center gap-1.5 ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Customer', 'Request type', 'Details', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(req => (
                <tr key={`${req.id}-${req.type}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{req.customer_name || `Customer #${req.customer_id}`}</p>
                    <p className="text-xs text-slate-400">{req.email || ''}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {req.type || req.request_type || 'Request'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                    {req.loan_type || req.card_type || req.account_type || '—'}
                    {req.amount ? ` — ₹${parseFloat(req.amount).toLocaleString('en-IN')}` : ''}
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(req.created_at || req.requested_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={(req.status || 'pending').toLowerCase()} />
                  </td>
                  <td className="px-5 py-4">
                    {(req.status || '').toLowerCase() === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <Button variant="success" size="sm" icon={CheckCircle}
                          loading={loading === `${req.id}-approve`}
                          onClick={() => handleAction(req.id, req.type || req.request_type, 'approve')}>
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" icon={XCircle}
                          loading={loading === `${req.id}-reject`}
                          onClick={() => handleAction(req.id, req.type || req.request_type, 'reject')}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardList size={32} className="text-slate-200" />
            <p className="text-sm text-slate-400">
              {activeTab === 'Pending' ? 'All caught up! No pending approvals.' : `No ${activeTab.toLowerCase()} requests.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
