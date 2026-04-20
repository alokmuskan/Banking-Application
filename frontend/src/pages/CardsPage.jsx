import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, ShieldAlert, CheckCircle, Plus, Users, Copy, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

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

  const isCustomer = user?.role === 'customer';

  const fetchCustomerData = async (targetCustomerId) => {
    try {
      const [accs, cardsResp] = await Promise.all([
        axios.get(`http://localhost:5000/api/accounts/customer/${targetCustomerId}`),
        axios.get(`http://localhost:5000/api/cards/customer/${targetCustomerId}`),
      ]);
      setAccounts(accs.data);
      if (accs.data.length > 0) setSelectedAccountId(accs.data[0].account_id);
      setCards(cardsResp.data);
    } catch { setAccounts([]); setCards([]); }
  };

  useEffect(() => {
    const init = async () => {
      if (isCustomer && user?.customerId) {
        const custResp = await axios.get('http://localhost:5000/api/customers');
        const me = custResp.data.find(c => c.customer_id === user.customerId);
        if (me) setCustomerName(me.name);
        fetchCustomerData(user.customerId);
      } else {
        const custResp = await axios.get('http://localhost:5000/api/customers');
        setCustomers(custResp.data);
      }
    };
    init();
  }, [user]);

  useEffect(() => {
    if (!isCustomer && selectedCustomerId) {
      fetchCustomerData(selectedCustomerId);
      const c = customers.find(c => c.customer_id === parseInt(selectedCustomerId));
      if (c) setCustomerName(c.name);
    } else if (!isCustomer) { setAccounts([]); setCards([]); }
  }, [selectedCustomerId]);

  const issueCard = async (type) => {
    const targetUserId = isCustomer ? user?.customerId : selectedCustomerId;
    const targetAccountId = isCustomer ? accounts[0]?.account_id : selectedAccountId;
    const status = isCustomer ? 'Pending' : 'Active';
    if (!targetUserId || !targetAccountId) return addToast('Please select a customer and account.', 'error');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/cards/issue', { customer_id: targetUserId, account_id: targetAccountId, type, status });
      addToast(`${type} card ${status === 'Active' ? 'issued' : 'requested'} successfully!`, 'success');
      fetchCustomerData(targetUserId);
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (cardId, current) => {
    const newStatus = current === 'Active' ? 'Blocked' : 'Active';
    try {
      await axios.put(`http://localhost:5000/api/cards/${cardId}/status`, { status: newStatus });
      addToast(`Card ${newStatus}`, 'success');
      const target = isCustomer ? user?.customerId : selectedCustomerId;
      if (target) fetchCustomerData(target);
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const fmt = (num) => num ? num.match(/.{1,4}/g).join(' ') : '•••• •••• •••• ••••';
  const maskNum = (num) => num ? `•••• •••• •••• ${num.slice(-4)}` : '•••• •••• •••• ••••';

  return (
    <div className="space-y-6">
      <PageHeader title={isCustomer ? 'Virtual cards' : 'Card issuance'} subtitle={isCustomer ? 'Manage your credit and debit cards.' : 'Issue cards directly to customers.'} />

      {/* ADMIN: customer selector */}
      {!isCustomer && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><Users size={16} className="text-primary-600" /> Select customer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white">
              <option value="">— Select customer —</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.email})</option>)}
            </select>
            <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} disabled={!selectedCustomerId}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white disabled:opacity-50">
              <option value="">— Select account —</option>
              {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.account_type} — #{a.account_id}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD DISPLAYS */}
        <div className="lg:col-span-2 space-y-4">
          {cards.length > 0 ? cards.map(card => (
            <div key={card.id} className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
              {/* Visual card */}
              <div className={`relative p-6 ${card.type === 'Credit' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-primary-900 to-primary-700'}`}>
                {card.status === 'Blocked' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Card Frozen</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <CreditCard size={24} className="text-white/80" />
                  <span className="text-white/70 text-sm font-medium">{card.type} Card</span>
                </div>
                <div className="mb-6">
                  <p className="text-white font-mono text-lg tracking-widest">{maskNum(card.card_number)}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wide">Card holder</p>
                    <p className="text-white text-sm font-medium">{customerName || 'NEXUS CUSTOMER'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs uppercase tracking-wide">Valid thru</p>
                    <p className="text-white text-sm font-medium">{card.expiry_date}</p>
                  </div>
                </div>
              </div>
              {/* Card actions */}
              <div className="px-5 py-4 flex items-center justify-between">
                <StatusBadge status={(card.status || 'pending').toLowerCase()} />
                <div className="flex items-center gap-2">
                  {card.status === 'Pending' && isCustomer ? (
                    <span className="text-xs text-slate-400">Awaiting approval</span>
                  ) : card.status !== 'Pending' ? (
                    <Button variant="outlined" size="sm"
                      icon={card.status === 'Active' ? ShieldAlert : CheckCircle}
                      onClick={() => toggleStatus(card.id, card.status)}>
                      {card.status === 'Active' ? 'Freeze' : 'Unfreeze'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-card flex flex-col items-center justify-center py-16 gap-3">
              <CreditCard size={32} className="text-slate-200" />
              <p className="text-sm text-slate-400">No cards found</p>
            </div>
          )}
        </div>

        {/* ISSUE NEW */}
        {(isCustomer || (!isCustomer && selectedAccountId)) && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6 space-y-4 h-fit">
            <h3 className="text-sm font-semibold text-slate-900">
              {isCustomer ? 'Request new card' : 'Issue card directly'}
            </h3>
            <p className="text-xs text-slate-500">
              {isCustomer ? 'Submit a request for Admin review.' : 'Instantly grant an active card.'}
            </p>
            <div className="space-y-3 pt-2">
              <Button variant="primary" className="w-full" icon={Plus} onClick={() => issueCard('Debit')} loading={loading}>
                {isCustomer ? 'Request' : 'Issue'} Debit Card
              </Button>
              <Button variant="outlined" className="w-full" icon={Plus} onClick={() => issueCard('Credit')} loading={loading}>
                {isCustomer ? 'Apply for' : 'Issue'} Credit Card
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardsPage;
