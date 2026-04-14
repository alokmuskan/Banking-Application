import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Search, Download } from 'lucide-react';
import '../styles/Pages.css';

const StatementPage = () => {
  const [history, setHistory] = useState([]);
  const [accId, setAccId] = useState('');

  const fetchHistory = async () => {
    if(!accId) return;
    try {
      const resp = await axios.get(`http://localhost:5000/api/transactions/account/${accId}`);
      setHistory(resp.data);
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Account Statement</h2>
        <div className="search-bar glass">
          <input type="text" placeholder="Enter Account ID..." value={accId} onChange={e => setAccId(e.target.value)} />
          <button onClick={fetchHistory}><Search size={18} /></button>
        </div>
      </div>

      <div className="glass table-container">
        <table className="statement-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? history.map(t => (
              <tr key={t.transaction_id}>
                <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                <td><span className={`type-dot ${t.type.toLowerCase()}`}></span>{t.type}</td>
                <td>{t.description || '-'}</td>
                <td className={t.type === 'Deposit' ? 'text-success' : 'text-danger'}>
                  {t.type === 'Deposit' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>No transactions found. Search for an account ID.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatementPage;
