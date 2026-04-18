import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, FileText, CreditCard, Landmark, PiggyBank } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/Pages.css';

const ApprovalsPage = () => {
    const { addToast } = useToast();
    const [pendingData, setPendingData] = useState({ accounts: [], cards: [], loans: [] });
    const [loading, setLoading] = useState(false);

    const fetchApprovals = async () => {
        try {
            const resp = await axios.get('http://localhost:5000/api/admin/approvals');
            setPendingData(resp.data);
        } catch (err) {
            console.error('Fetch approvals err:', err);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleAction = async (type, id, newStatus) => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/admin/approvals/${type}/${id}`, { status: newStatus });
            addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} ${newStatus} Successfully`, 'success');
            fetchApprovals();
        } catch(err) {
            addToast(`Failed: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Approvals Center</h2>
                <p>Manage pending customer requests for accounts, cards, and loans.</p>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem'}}>
                
                {/* Accounts Approvals */}
                <div className="glass" style={{padding: '1.5rem', borderRadius: '1rem'}}>
                    <h3><Landmark size={20} color="var(--accent)" style={{marginRight: '0.5rem'}}/> Pending Account Requests</h3>
                    <table className="data-table" style={{marginTop: '1rem'}}>
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Customer Name</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingData.accounts.length > 0 ? pendingData.accounts.map(acc => (
                                <tr key={acc.account_id}>
                                    <td>#{acc.account_id}</td>
                                    <td>{acc.customer_name}</td>
                                    <td>{acc.account_type}</td>
                                    <td>{new Date(acc.open_date).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button className="btn-primary" disabled={loading} style={{padding: '0.4rem 0.8rem'}} onClick={() => handleAction('account', acc.account_id, 'Active')}><CheckCircle size={16}/> Approve</button>
                                            <button className="btn-secondary" disabled={loading} style={{padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444'}} onClick={() => handleAction('account', acc.account_id, 'Rejected')}><XCircle size={16}/> Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)'}}>No pending accounts.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Cards Approvals */}
                <div className="glass" style={{padding: '1.5rem', borderRadius: '1rem'}}>
                    <h3><CreditCard size={20} color="var(--accent)" style={{marginRight: '0.5rem'}}/> Pending Virtual Cards</h3>
                    <table className="data-table" style={{marginTop: '1rem'}}>
                        <thead>
                            <tr>
                                <th>Req ID</th>
                                <th>Customer</th>
                                <th>Card Type</th>
                                <th>Req Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingData.cards.length > 0 ? pendingData.cards.map(card => (
                                <tr key={card.id}>
                                    <td>#{card.id}</td>
                                    <td>{card.customer_name}</td>
                                    <td>{card.type}</td>
                                    <td>{new Date(card.issue_date).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button className="btn-primary" disabled={loading} style={{padding: '0.4rem 0.8rem'}} onClick={() => handleAction('card', card.id, 'Active')}><CheckCircle size={16}/> Approve</button>
                                            <button className="btn-secondary" disabled={loading} style={{padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444'}} onClick={() => handleAction('card', card.id, 'Rejected')}><XCircle size={16}/> Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)'}}>No pending cards.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Loans Approvals */}
                <div className="glass" style={{padding: '1.5rem', borderRadius: '1rem'}}>
                    <h3><PiggyBank size={20} color="var(--accent)" style={{marginRight: '0.5rem'}}/> Pending Loans</h3>
                    <table className="data-table" style={{marginTop: '1rem'}}>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Loan Type</th>
                                <th>Principal</th>
                                <th>Term</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingData.loans.length > 0 ? pendingData.loans.map(loan => (
                                <tr key={loan.id}>
                                    <td>{loan.customer_name}</td>
                                    <td>{loan.loan_type}</td>
                                    <td>₹{parseFloat(loan.principal).toLocaleString('en-IN')} @ {loan.interest_rate}%</td>
                                    <td>{loan.term_months} months</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button className="btn-primary" disabled={loading} style={{padding: '0.4rem 0.8rem'}} onClick={() => handleAction('loan', loan.id, 'Approved')}><CheckCircle size={16}/> Approve</button>
                                            <button className="btn-secondary" disabled={loading} style={{padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444'}} onClick={() => handleAction('loan', loan.id, 'Rejected')}><XCircle size={16}/> Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)'}}>No pending loan requests.</td></tr>}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default ApprovalsPage;
