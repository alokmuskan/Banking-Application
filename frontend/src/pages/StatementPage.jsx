import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, FileSpreadsheet, Search, TrendingDown, TrendingUp, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const formatINR = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const StatementPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccId, setSelectedAccId] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const isCustomer = user?.role === 'customer';

  // Fetch customer accounts for the account dropdown
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        if (isCustomer) {
          let custId = user?.customerId;
          if (!custId && user?.email) {
            const cResp = await axios.get('http://localhost:5000/api/customers');
            const me = cResp.data.find(c => c.email === user.email);
            if (me) custId = me.customer_id;
          }
          if (custId) {
            const aResp = await axios.get(`http://localhost:5000/api/accounts/customer/${custId}`);
            setAccounts(aResp.data);
          }
        } else {
          const aResp = await axios.get('http://localhost:5000/api/accounts');
          setAccounts(aResp.data);
        }
      } catch {}
    };
    loadAccounts();
  }, [user, isCustomer]);

  const fetchHistory = async (accId) => {
    setLoading(true);
    try {
      if (accId) {
        const resp = await axios.get(`http://localhost:5000/api/transactions/account/${accId}`);
        setHistory(resp.data);
      } else {
        const resp = await axios.get('http://localhost:5000/api/transactions/global/recent');
        setHistory(resp.data);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(selectedAccId); }, [selectedAccId]);

  const filtered = history.filter(t => {
    const matchType = typeFilter === 'All' || t.type === typeFilter;
    const matchSearch = !search || String(t.from_account_id).includes(search) || String(t.to_account_id).includes(search) || (t.description || '').toLowerCase().includes(search.toLowerCase()) || (t.type || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalCredits = filtered.filter(t => t.type === 'Deposit').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalDebits = filtered.filter(t => t.type !== 'Deposit').reduce((s, t) => s + parseFloat(t.amount), 0);

  const txTypeColor = (type) => {
    if (type === 'Deposit') return 'text-emerald-600';
    if (type === 'Withdrawal') return 'text-red-600';
    return 'text-blue-600';
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('NexusBank', 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    const accLabel = selectedAccId ? `Account #${selectedAccId}` : 'All Accounts';
    doc.text(`Account Statement — ${accLabel}`, 14, 27);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
    autoTable(doc, {
      head: [['Date', 'Time', 'Type', 'From Acc', 'To Acc', 'Description', 'Amount']],
      body: filtered.map(t => [
        formatDate(t.timestamp),
        formatTime(t.timestamp),
        t.type,
        t.from_account_id || '—',
        t.to_account_id || '—',
        t.description || '—',
        `INR ${parseFloat(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      ]),
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save(`NexusBank_Statement_${Date.now()}.pdf`);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(t => ({
      Date: formatDate(t.timestamp),
      Time: formatTime(t.timestamp),
      Type: t.type,
      'From Account': t.from_account_id || '',
      'To Account': t.to_account_id || '',
      Description: t.description || '',
      Amount: parseFloat(t.amount),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statement');
    XLSX.writeFile(wb, `NexusBank_Statement_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Account statement" subtitle="View and export your transaction history.">
        <Button variant="outlined" icon={FileText} size="sm" onClick={downloadPDF}>Export PDF</Button>
        <Button variant="outlined" icon={FileSpreadsheet} size="sm" onClick={downloadExcel}>Export Excel</Button>
      </PageHeader>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card p-4 flex flex-wrap gap-3 items-center">
        {/* Account selector */}
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[200px]">
          <label className="text-xs font-medium text-slate-500">Filter by account</label>
          <select value={selectedAccId} onChange={e => setSelectedAccId(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
            <option value="">All transactions</option>
            {accounts.map(a => (
              <option key={a.account_id} value={a.account_id}>
                Acc 1000{5000 + a.account_id} — {a.account_type}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500">Transaction type</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
            {['All', 'Deposit', 'Withdrawal', 'Transfer'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1 w-full sm:w-64">
          <label className="text-xs font-medium text-slate-500">Search</label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 pl-8 pr-3 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total credits', value: formatINR(totalCredits), cls: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', icon: <TrendingUp size={14} className="text-emerald-500" /> },
          { label: 'Total debits', value: formatINR(totalDebits), cls: 'text-red-600', bg: 'bg-red-50 border-red-100', icon: <TrendingDown size={14} className="text-red-500" /> },
          { label: 'Net balance', value: formatINR(totalCredits - totalDebits), cls: totalCredits >= totalDebits ? 'text-emerald-600' : 'text-red-600', bg: 'bg-slate-50 border-slate-100', icon: null },
        ].map(({ label, value, cls, bg, icon }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <div className="flex items-center gap-1.5 mb-1">{icon}<p className="text-xs text-slate-500">{label}</p></div>
            <p className={`text-lg font-bold ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Date & Time', 'Type', 'From Account', 'To Account', 'Description', 'Amount'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">Loading...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(t => (
                  <tr key={t.transaction_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className="font-medium text-slate-900">{formatDate(t.timestamp)}</p>
                      <p className="text-xs text-slate-400">{formatTime(t.timestamp)}</p>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={t.type?.toLowerCase()} /></td>
                    <td className="px-5 py-3 font-mono text-slate-600">{t.from_account_id ? `Acc #${t.from_account_id}` : '—'}</td>
                    <td className="px-5 py-3 font-mono text-slate-600">{t.to_account_id ? `Acc #${t.to_account_id}` : '—'}</td>
                    <td className="px-5 py-3 text-slate-500 max-w-[160px] truncate">{t.description || '—'}</td>
                    <td className={`px-5 py-3 font-semibold whitespace-nowrap ${txTypeColor(t.type)}`}>
                      {t.type === 'Deposit' ? '+' : '−'}{formatINR(t.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No transactions match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatementPage;
