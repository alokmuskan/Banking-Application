import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, ShieldAlert, CheckCircle, Plus, Users, Eye, EyeOff, Wifi, Copy } from 'lucide-react';
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
  const [revealedCard, setRevealedCard] = useState(null); // card id whose details are visible

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
      if (isCustomer) {
        let custId = user?.customerId;
        if (!custId && user?.email) {
          const custResp = await axios.get('http://localhost:5000/api/customers');
          const me = custResp.data.find(c => c.email === user.email);
          if (me) { custId = me.customer_id; setCustomerName(me.name); }
        } else if (custId) {
          const custResp = await axios.get('http://localhost:5000/api/customers');
          const me = custResp.data.find(c => c.customer_id === custId);
          if (me) setCustomerName(me.name);
        }
        if (custId) fetchCustomerData(custId);
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
    } else if (!isCustomer && !selectedCustomerId) { setAccounts([]); setCards([]); }
  }, [selectedCustomerId]);

  const issueCard = async (type) => {
    const targetUserId = isCustomer ? (user?.customerId || accounts[0]?.customer_id) : selectedCustomerId;
    const targetAccountId = isCustomer ? accounts[0]?.account_id : selectedAccountId;
    // Customers always get Pending; admin always gets Active
    const status = isCustomer ? 'Pending' : 'Active';
    if (!targetUserId || !targetAccountId) return addToast('Please select a customer and account.', 'error');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/cards/issue', {
        customer_id: targetUserId,
        account_id: targetAccountId,
        type,
        status,
      });
      addToast(
        isCustomer
          ? `${type} card request submitted! Awaiting admin approval.`
          : `${type} card issued successfully.`,
        'success'
      );
      fetchCustomerData(targetUserId);
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (cardId, current) => {
    const newStatus = current === 'Active' ? 'Blocked' : 'Active';
    try {
      await axios.put(`http://localhost:5000/api/cards/${cardId}/status`, { status: newStatus });
      addToast(`Card ${newStatus === 'Blocked' ? 'frozen' : 'unfrozen'}`, 'success');
      const target = isCustomer ? (user?.customerId || accounts[0]?.customer_id) : selectedCustomerId;
      if (target) fetchCustomerData(target);
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => addToast('Copied!', 'success'));
  };

  const formatCard = (num) => num ? num.match(/.{1,4}/g).join(' ') : '•••• •••• •••• ••••';
  const maskCard  = (num) => num ? `•••• •••• •••• ${num.slice(-4)}` : '•••• •••• •••• ••••';

  const cardGradient = (type, status) => {
    if (status === 'Blocked') return 'from-slate-500 to-slate-700';
    if (type === 'Credit') return 'from-slate-800 via-slate-700 to-slate-900';
    return 'from-primary-800 via-primary-700 to-primary-900';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCustomer ? 'Virtual cards' : 'Card issuance'}
        subtitle={isCustomer ? 'View and manage your bank cards.' : 'Issue and manage customer cards.'}
      />

      {/* ADMIN: customer + account selectors */}
      {!isCustomer && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-primary-600" /> Select customer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
              <option value="">— Select customer —</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.email})</option>)}
            </select>
            <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} disabled={!selectedCustomerId}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:opacity-50">
              <option value="">— Select account —</option>
              {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.account_type} — #{a.account_id}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cards list */}
        <div className="lg:col-span-2 space-y-5">
          {cards.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-card flex flex-col items-center py-16 gap-3">
              <CreditCard size={32} className="text-slate-200" />
              <p className="text-sm text-slate-400">No cards found</p>
            </div>
          ) : cards.map(card => {
            const isRevealed = revealedCard === card.id;
            return (
              <div key={card.id} className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
                {/* ── Realistic card ── */}
                <div className={`relative bg-gradient-to-br ${cardGradient(card.type, card.status)} p-6 mx-0`}
                  style={{ minHeight: '180px', maxWidth: '380px' }}>

                  {/* Frozen overlay */}
                  {card.status === 'Blocked' && (
                    <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40 flex items-center justify-center z-10 rounded-none">
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        <ShieldAlert size={14} /> Card Frozen
                      </div>
                    </div>
                  )}

                  {/* Top row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-5 bg-amber-400 rounded-sm opacity-90 flex items-center justify-center">
                        <div className="w-6 h-3.5 bg-amber-300 rounded-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wifi size={18} className="text-white/60 rotate-90" />
                      <span className="text-white/70 text-xs font-medium">{card.type}</span>
                    </div>
                  </div>

                  {/* Card number */}
                  <div className="mb-5">
                    <p className="text-white font-mono text-lg tracking-widest select-none">
                      {isRevealed ? formatCard(card.card_number) : maskCard(card.card_number)}
                    </p>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Card holder</p>
                      <p className="text-white text-sm font-semibold">{customerName || 'NEXUS CUSTOMER'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Expires</p>
                      <p className="text-white text-sm font-mono">{card.expiry_date}</p>
                    </div>
                    {/* Mastercard circles */}
                    <div className="flex">
                      <div className="w-7 h-7 rounded-full bg-red-500 opacity-80 -mr-3" />
                      <div className="w-7 h-7 rounded-full bg-amber-400 opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Card actions bar */}
                <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={(card.status || 'pending').toLowerCase()} />
                  <div className="flex items-center gap-2">
                    {/* Show/hide card number */}
                    <button onClick={() => setRevealedCard(isRevealed ? null : card.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2.5 py-1.5 rounded-lg transition">
                      {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                      {isRevealed ? 'Hide' : 'Show'} details
                    </button>
                    {isRevealed && (
                      <button onClick={() => copyToClipboard(card.card_number)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2.5 py-1.5 rounded-lg transition">
                        <Copy size={12} /> Copy
                      </button>
                    )}
                    {/* Freeze/Unfreeze — customers can't unfreeze; admin can always act except on pending */}
                    {card.status === 'Pending' && isCustomer ? (
                      <span className="text-xs text-amber-500 font-medium">Pending approval</span>
                    ) : card.status !== 'Pending' ? (
                      <Button variant={card.status === 'Active' ? 'danger' : 'success'} size="sm"
                        icon={card.status === 'Active' ? ShieldAlert : CheckCircle}
                        onClick={() => toggleStatus(card.id, card.status)}>
                        {card.status === 'Active' ? 'Freeze' : 'Unfreeze'}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Revealed details panel */}
                {isRevealed && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex flex-wrap gap-6">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Card number</p>
                      <p className="font-mono text-sm font-semibold text-slate-900">{formatCard(card.card_number)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">CVV</p>
                      <p className="font-mono text-sm font-semibold text-slate-900">{card.cvv || '•••'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Valid thru</p>
                      <p className="font-mono text-sm font-semibold text-slate-900">{card.expiry_date}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Issue new card panel */}
        {(isCustomer || (!isCustomer && selectedAccountId)) && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-card p-6 space-y-4 h-fit">
            <h3 className="text-sm font-semibold text-slate-900">
              {isCustomer ? 'Request a new card' : 'Issue card directly'}
            </h3>
            <p className="text-xs text-slate-400">
              {isCustomer
                ? 'Your request goes to admin for approval before activation.'
                : 'Card will be immediately active for the customer.'}
            </p>
            <div className="space-y-3 pt-1">
              <Button variant="primary" className="w-full" icon={Plus} onClick={() => issueCard('Debit')} loading={loading}>
                {isCustomer ? 'Request' : 'Issue'} Debit Card
              </Button>
              <Button variant="outlined" className="w-full" icon={Plus} onClick={() => issueCard('Credit')} loading={loading}>
                {isCustomer ? 'Apply for' : 'Issue'} Credit Card
              </Button>
            </div>
            {isCustomer && (
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                🔒 Card details are hidden by default for security. Use the "Show details" button to reveal.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardsPage;
