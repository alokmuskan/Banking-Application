import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CreditCard, ShieldAlert, CheckCircle, Plus, Users } from 'lucide-react';
import '../styles/Pages.css';

const CardsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  const [loading, setLoading] = useState(false);

  const fetchCustomerData = async (targetCustomerId) => {
    try {
      const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${targetCustomerId}`);
      setAccounts(accs.data);
      if(accs.data.length > 0) setSelectedAccountId(accs.data[0].account_id);

      const cardsResp = await axios.get(`http://localhost:5000/api/cards/customer/${targetCustomerId}`);
      setCards(cardsResp.data);
    } catch (err) {
      console.error(err);
      setAccounts([]);
      setCards([]);
    }
  };

  const fetchInitialData = async () => {
    try {
      if (user?.role === 'customer' && user?.customerId) {
        const custResp = await axios.get('http://localhost:5000/api/customers');
        const me = custResp.data.find(c => c.customer_id === user.customerId);
        if(me) setCustomerName(me.name);
        fetchCustomerData(user.customerId);
      } else {
        // Admin
        const custResp = await axios.get('http://localhost:5000/api/customers');
        setCustomers(custResp.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  // Admin dropdown handler
  useEffect(() => {
      if (selectedCustomerId) {
          fetchCustomerData(selectedCustomerId);
          const c = customers.find(c => c.customer_id === parseInt(selectedCustomerId));
          if(c) setCustomerName(c.name);
      } else if (user?.role !== 'customer') {
          setAccounts([]);
          setCards([]);
      }
  }, [selectedCustomerId]);

  const issueCard = async (type) => {
    const targetUserId = user?.role === 'customer' ? user?.customerId : selectedCustomerId;
    const targetAccountId = user?.role === 'customer' ? accounts[0]?.account_id : selectedAccountId;
    const directStatus = user?.role === 'customer' ? 'Pending' : 'Active';

    if (!targetUserId || !targetAccountId) return addToast('Please select a customer and account.', 'error');
    setLoading(true);
    try {
        await axios.post('http://localhost:5000/api/cards/issue', {
            customer_id: targetUserId,
            account_id: targetAccountId,
            type: type,
            status: directStatus // Admin bypass
        });
        addToast(`${type} Card ${directStatus === 'Active' ? 'Issued' : 'Requested'} Successfully!`, 'success');
        fetchCustomerData(targetUserId);
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
          const target = user?.role === 'customer' ? user?.customerId : selectedCustomerId;
          if(target) fetchCustomerData(target);
      } catch(err) {
          addToast(err.response?.data?.error || 'Failed to update status', 'error');
      }
  };

  const formatCardNum = (num) => num ? num.match(/.{1,4}/g).join(' ') : '';

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{user?.role === 'customer' ? 'Virtual Cards' : 'Card Issuance System'}</h2>
        <p>{user?.role === 'customer' ? 'Manage your credit and debit cards securely.' : 'Directly issue cards to registered customers.'}</p>
      </div>

      {user?.role !== 'customer' && (
          <div className="glass" style={{padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem'}}>
             <h3><Users size={20} color="var(--accent)" style={{marginRight: '0.5rem'}}/> Select Target Customer</h3>
             <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                 <select className="form-control" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} style={{background: 'var(--bg-tertiary)', flex: 1}}>
                     <option value="">-- Select Customer --</option>
                     {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.email})</option>)}
                 </select>
                 <select className="form-control" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} style={{background: 'var(--bg-tertiary)', flex: 1}} disabled={!selectedCustomerId}>
                     <option value="">-- Select Account --</option>
                     {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.account_type} - #{a.account_id}</option>)}
                 </select>
             </div>
          </div>
      )}

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
                    {card.status === 'Pending' && user?.role === 'customer' ? (
                        <div style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Awaiting Admin Approval</div>
                    ) : (
                        <button 
                            onClick={() => toggleStatus(card.id, card.status)}
                            className={`action-btn ${card.status === 'Active' ? 'block-btn' : 'unblock-btn'}`}
                            disabled={card.status === 'Pending'} // Prevent admin from freezing a pending card directly
                        >
                            {card.status === 'Active' ? <><ShieldAlert size={16}/> Freeze</> : <><CheckCircle size={16}/> Unfreeze</>}
                        </button>
                    )}
                </div>
            </div>
        ))}

        {/* Issue New Card Interface */}
        {/* {((user?.role === 'customer' && accounts.length > 0) || (user?.role !== 'customer' && selectedAccountId)) && ( */}
        {((user?.role === 'customer') || (user?.role !== 'customer' && selectedAccountId)) && (
            <div className="issue-card-panel glass">
                <h3>{user?.role === 'customer' ? 'Issue New Card' : 'Issue Direct Card'}</h3>
                <p>{user?.role === 'customer' ? 'Get instant access to a virtual card linked to your primary account.' : 'Instantly grant an active card to this customer.'}</p>
                <div className="issue-actions">
                    <button className="btn-primary" onClick={() => issueCard('Debit')} disabled={loading}>
                        <Plus size={18} /> {user?.role === 'customer' ? 'Request' : 'Issue'} Debit Card
                    </button>
                    <button className="btn-secondary" onClick={() => issueCard('Credit')} disabled={loading}>
                        <Plus size={18} /> {user?.role === 'customer' ? 'Apply for' : 'Issue'} Credit Card
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CardsPage;
