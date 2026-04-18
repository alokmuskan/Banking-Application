import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, Info, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../styles/Pages.css';

const StatementPage = () => {
  const [history, setHistory] = useState([]);
  const [accId, setAccId] = useState('');

  const fetchGlobalHistory = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/transactions/global/recent');
      setHistory(resp.data);
    } catch (err) { console.error('Failed to fetch global history:', err); }
  };

  const fetchAccountHistory = async (id) => {
    try {
      const resp = await axios.get(`http://localhost:5000/api/transactions/account/${id}`);
      setHistory(resp.data);
    } catch (err) { console.error('Error fetching account history:', err); }
  };

  useEffect(() => {
    fetchGlobalHistory();
  }, []);

  useEffect(() => {
    if (accId.trim() === '') {
      fetchGlobalHistory();
    } else {
      const timer = setTimeout(() => {
        fetchAccountHistory(accId);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [accId]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Brand Header
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("Banking Management System", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Account Statement for ID: ${accId || 'All'}`, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

    const tableColumn = ["Date", "Type", "Description", "Amount (INR)"];
    const tableRows = history.map(t => [
      new Date(t.timestamp).toLocaleDateString(),
      t.type,
      t.description || '-',
      `${t.type === 'Deposit' ? '+' : '-'} ${parseFloat(t.amount).toFixed(2)}`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [108, 92, 231] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`Statement_Acc_${accId || 'All'}.pdf`);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(history.map(t => ({
      Date: new Date(t.timestamp).toLocaleDateString(),
      Time: new Date(t.timestamp).toLocaleTimeString(),
      Type: t.type,
      Description: t.description || '-',
      Amount: t.amount
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");
    XLSX.writeFile(workbook, `Statement_Acc_${accId || 'All'}.xlsx`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Account Statement</h2>
        <div className="search-bar glass">
          <input 
            type="text" 
            placeholder="Search Acc ID (e.g. 1)..." 
            value={accId} 
            onChange={e => setAccId(e.target.value)} 
          />
          <Search size={18} color="var(--text-secondary)" />
        </div>
        <div className="export-controls">
          <button className="btn-secondary" onClick={downloadPDF} disabled={history.length === 0}>
            <FileText size={18} /> Download PDF
          </button>
          <button className="btn-secondary" onClick={downloadExcel} disabled={history.length === 0}>
            <FileSpreadsheet size={18} /> Download XLSX
          </button>
        </div>
      </div>

      <div className="statement-content-grid">
        <div className="glass table-container">
          <table className="statement-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map(t => (
                <tr key={t.transaction_id}>
                  <td>
                    <div className="datetime-cell">
                      <span>{new Date(t.timestamp).toLocaleDateString()}</span>
                      <small><Clock size={10} /> {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  </td>
                  <td><span className={`type-dot ${t.type.toLowerCase()}`}></span>{t.type}</td>
                  <td>{t.description || '-'}</td>
                  <td className={t.type === 'Deposit' ? 'text-success' : 'text-danger'} style={{fontWeight: '700'}}>
                    {t.type === 'Deposit' ? '+' : '-'} ₹{parseFloat(t.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="statement-sidebar">
          <div className="glass legend-card">
            <h3><Info size={18} /> Transaction Legend</h3>
            <ul className="legend-list">
              <li><span className="dot deposit"></span> <strong>Deposit:</strong> Funds added to account (Credit)</li>
              <li><span className="dot withdrawal"></span> <strong>Withdrawal:</strong> Cash removed (Debit)</li>
              <li><span className="dot transfer"></span> <strong>Transfer:</strong> Funds moved between accounts</li>
            </ul>
            <div className="color-code-info">
              <p><span className="text-success">Green</span> indicates an increase in balance.</p>
              <p><span className="text-danger">Red</span> indicates a deduction from balance.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StatementPage;
