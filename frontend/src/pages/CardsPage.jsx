import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CreditCard, ShieldAlert, CheckCircle, Plus } from 'lucide-react';
import '../styles/Pages.css';

const CardsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user?.customerId) return;
    try {
      const custResp = await axios.get('http://localhost:5000/api/customers');
      const me = custResp.data.find(c => c.customer_id === user.customerId);
      if(me) setCustomerName(me.name);

      const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${user.customerId}`);
      setAccounts(accs.data);

      const cardsResp = await axios.get(`http://localhost:5000/api/cards/customer/${user.customerId}`);
      setCards(cardsResp.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const issueCard = async (type) => {
    if (accounts.length === 0) return addToast('No active accounts.', 'error');
    setLoading(true);
    try {
        await axios.post('http://localhost:5000/api/cards/issue', {
            customer_id: user.customerId,
            account_id: accounts[0].account_id, // Default to first account
            type: type
        });
        addToast(`${type} Card Issued Successfully!`, 'success');
        fetchData();
    } catch(err) {
        addToast(err.response?.data?.error || 'Failed to issue card', 'error');
    } finally {
        setLoading(false);
    }
  };

  const toggleStatus = async (cardId, currentStatus) => {
      const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
      try {
          await axios.put(`http://localhost:5000/api/cards/${cardId}/status`, { status: newStatus });
          addToast(`Card ${newStatus}`, 'success');
          fetchData();
      } catch(err) {
          addToast(err.response?.data?.error || 'Failed to update status', 'error');
      }
  };

  const formatCardNum = (num) => num.match(/.{1,4}/g).join(' ');

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Virtual Cards</h2>
        <p>Manage your credit and debit cards securely.</p>
      </div>

      <div className="cards-grid">
        {/* Render Existing Cards */}
        {cards.map(card => (
            <div key={card.id} className="card-wrapper">
                <div className={`virtual-card ${card.type.toLowerCase()} ${card.status.toLowerCase()}`}>
                    <div className="card-top">
                        <CreditCard size={28} color="rgba(255,255,255,0.8)" />
                        <span className="card-type">{card.type}</span>
                    </div>
                    
                    <div className="card-chip-container">
                        <div className="card-chip"></div>
                        <div className="contactless">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14c-.3-1.4-.3-2.6 0-4M12 16.5c-.8-2.6-.8-6.4 0-9M15.5 19c-1.3-4.2-1.3-9.8 0-14"/></svg>
                        </div>
                    </div>

                    <div className="card-number">
                        {card.status === 'Blocked' ? '**** **** **** ****' : formatCardNum(card.card_number)}
                    </div>

                    <div className="card-bottom">
                        <div className="card-holder">
                            <div className="label">Card Holder</div>
                            <div className="value">{customerName || 'NEXUS CUSTOMER'}</div>
                        </div>
                        <div className="card-expiry">
                            <div className="label">Valid Thru</div>
                            <div className="value">{card.expiry_date}</div>
                        </div>
                    </div>
                </div>

                <div className="card-actions glass">
                    <div className="status-indicator">
                        Status: <span className={`status-tag ${card.status.toLowerCase()}`}>{card.status}</span>
                    </div>
                    {card.status === 'Pending' ? (
                        <div style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Awaiting Admin Approval</div>
                    ) : (
                        <button 
                            onClick={() => toggleStatus(card.id, card.status)}
                            className={`action-btn ${card.status === 'Active' ? 'block-btn' : 'unblock-btn'}`}
                        >
                            {card.status === 'Active' ? <><ShieldAlert size={16}/> Freeze Card</> : <><CheckCircle size={16}/> Unfreeze</>}
                        </button>
                    )}
                </div>
            </div>
        ))}

        {/* Issue New Card Interface */}
        <div className="issue-card-panel glass">
            <h3>Issue New Card</h3>
            <p>Get instant access to a virtual card linked to your primary account.</p>
            <div className="issue-actions">
                <button className="btn-primary" onClick={() => issueCard('Debit')} disabled={loading}>
                    <Plus size={18} /> Request Debit Card
                </button>
                <button className="btn-secondary" onClick={() => issueCard('Credit')} disabled={loading}>
                    <Plus size={18} /> Apply for Credit Card
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CardsPage;
