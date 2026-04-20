import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, FileSpreadsheet, Search, Clock, TrendingDown, TrendingUp } from 'lucide-react';
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
  const [accId, setAccId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGlobalHistory = async () => {
    setLoading(true);
    try {
      const resp = await axios.get('http://localhost:5000/api/transactions/global/recent');
      setHistory(resp.data);
    } finally { setLoading(false); }
  };

  const fetchAccountHistory = async (id) => {
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:5000/api/transactions/account/${id}`);
      setHistory(resp.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchGlobalHistory(); }, []);

  useEffect(() => {
    if (!accId.trim()) { fetchGlobalHistory(); return; }
    const t = setTimeout(() => fetchAccountHistory(accId), 400);
    return () => clearTimeout(t);
  }, [accId]);

  const totalCredits = history.filter(t => t.type === 'Deposit').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalDebits = history.filter(t => t.type !== 'Deposit').reduce((s, t) => s + parseFloat(t.amount), 0);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('NexusBank', 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Account Statement${accId ? ` — Acc #${accId}` : ' (All)'}`, 14, 27);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
    autoTable(doc, {
      head: [['Date', 'Time', 'Type', 'Description', 'Amount']],
      body: history.map(t => [
        formatDate(t.timestamp),
        formatTime(t.timestamp),
        t.type,
        t.description || '—',
        `${t.type === 'Deposit' ? '+' : '-'} ₹${parseFloat(t.amount).toFixed(2)}`,
      ]),
      startY: 40,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`NexusBank_Statement_${accId || 'All'}.pdf`);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(history.map(t => ({
      Date: formatDate(t.timestamp),
      Time: formatTime(t.timestamp),
      Type: t.type,
      Description: t.description || '—',
      Amount: parseFloat(t.amount),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statement');
    XLSX.writeFile(wb, `NexusBank_Statement_${accId || 'All'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Account statement" subtitle="View and export your transaction history.">
        <Button variant="outlined" icon={FileSpreadsheet} onClick={downloadExcel} disabled={history.length === 0} size="sm">
          Export Excel
        </Button>
        <Button variant="outlined" icon={FileText} onClick={downloadPDF} disabled={history.length === 0} size="sm">
          Export PDF
        </Button>
      </PageHeader>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total records', value: history.length, color: 'text-slate-900' },
          { label: 'Total credits', value: formatINR(totalCredits), color: 'text-emerald-600', icon: TrendingUp },
          { label: 'Total debits', value: formatINR(totalDebits), color: 'text-red-600', icon: TrendingDown },
          { label: 'Account filter', value: accId || 'All accounts', color: 'text-primary-600' },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <div className="flex items-center gap-1">
              {Icon && <Icon size={14} className={color} />}
              <p className={`text-base font-semibold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by account ID..."
            value={accId}
            onChange={e => setAccId(e.target.value)}
            className="h-9 w-full pl-9 pr-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date & Time</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-sm text-slate-400">Loading...</td></tr>
            ) : history.length > 0 ? history.map(t => (
              <tr key={t.transaction_id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-5 py-3">
                  <span className="block text-slate-900 font-medium">{formatDate(t.timestamp)}</span>
                  <span className="block text-xs text-slate-400 flex items-center gap-1"><Clock size={10} />{formatTime(t.timestamp)}</span>
                </td>
                <td className="px-5 py-3 text-slate-600">{t.description || '—'}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={t.type.toLowerCase()} label={t.type} />
                </td>
                <td className={`px-5 py-3 text-right font-semibold ${t.type === 'Deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'Deposit' ? '+' : '-'}{formatINR(t.amount)}
                </td>
                <td className="px-5 py-3 text-center">
                  <StatusBadge status="success" label="Completed" size="sm" />
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-12 text-sm text-slate-400">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatementPage;
