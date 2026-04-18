import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Headset, Send, MessageCircle, AlertCircle } from 'lucide-react';
import '../styles/Pages.css';

const SupportPage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '', category: 'Account Issue', description: ''
    });

    const fetchTickets = async () => {
        if (!user?.customerId) return;
        try {
            const resp = await axios.get(`http://localhost:5000/api/support/tickets/${user.customerId}`);
            setTickets(resp.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/support/tickets', {
                customer_id: user.customerId,
                ...formData
            });
            addToast('Support Ticket Submitted Successfully!', 'success');
            setFormData({ subject: '', category: 'Account Issue', description: '' });
            fetchTickets();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to submit ticket', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Customer Support</h2>
                <p>We're here to help. Submit a dispute or technical issue.</p>
            </div>

            <div className="support-grid">
                
                {/* Submit Form */}
                <div className="glass form-card">
                    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                        <h3><Headset size={20} color="var(--accent)" /> Create Ticket</h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '1rem' }}>
                        <div className="input-group">
                            <label>Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required style={{background: 'var(--bg-tertiary)'}}>
                                <option value="Account Issue">Account Issue</option>
                                <option value="Dispute">Transaction Dispute</option>
                                <option value="Lost Card">Lost / Stolen Card</option>
                                <option value="Other">Other Query</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Subject</label>
                            <input type="text" placeholder="Brief subject" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{background: 'var(--bg-tertiary)'}} />
                        </div>

                        <div className="input-group">
                            <label>Description</label>
                            <textarea 
                                placeholder="Please describe the issue in detail..." 
                                required rows="5"
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                style={{background: 'var(--bg-tertiary)', width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical'}}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-primary full-width" disabled={loading} style={{marginTop: '0.5rem'}}>
                            {loading ? 'Submitting...' : <><Send size={16}/> Submit Ticket</>}
                        </button>
                    </form>
                </div>

                {/* Ticket History */}
                <div className="tickets-list">
                    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                        <h3><MessageCircle size={20} color="var(--text-secondary)" /> My Tickets</h3>
                    </div>

                    <div className="tickets-container">
                        {tickets.length > 0 ? tickets.map(ticket => (
                            <div key={ticket.id} className="ticket-card glass">
                                <div className="ticket-header">
                                    <div className="ticket-title">
                                        <span className="ticket-id">#{ticket.id}</span>
                                        <strong>{ticket.subject}</strong>
                                    </div>
                                    <span className={`status-tag ${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span>
                                </div>
                                <div className="ticket-body">
                                    <p>{ticket.description}</p>
                                </div>
                                <div className="ticket-footer">
                                    <span className="ticket-category">{ticket.category}</span>
                                    <span className="ticket-date">{new Date(ticket.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="no-data glass" style={{padding: '3rem'}}>
                                <AlertCircle size={48} color="var(--border)" style={{marginBottom: '1rem'}} />
                                <p>You have no open support tickets.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SupportPage;
