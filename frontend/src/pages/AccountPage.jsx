import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, Landmark, UserPlus, Image, FileCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/Pages.css';

const AccountPage = () => {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '', 
    branch_id: '', 
    account_type: 'Savings', 
    initial_balance: '0',
    name: '', email: '', phone: '', dob: '',
    perm_village: '', perm_district: '', perm_city: '', perm_state: '', perm_pincode: '',
    temp_village: '', temp_district: '', temp_city: '', temp_state: '', temp_pincode: '',
    profilePhoto: null, idProof: null, signature: null,
    gender: '', occupation: '', annual_income: '', nationality: 'Indian',
    kyc_document_type: '', kyc_document_no: ''
  });

  const [isSameAsPermanent, setIsSameAsPermanent] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const fetchData = async () => {
    // Robust fetching: isolation of each request so one 404 or error doesn't block everything
    try {
      const resp = await axios.get('http://localhost:5000/api/customers');
      setCustomers(resp.data);
      
      // Fetch accounts for the first customer if available
      if(resp.data && resp.data.length > 0) {
        try {
          const accs = await axios.get(`http://localhost:5000/api/accounts/customer/${resp.data[0].customer_id}`);
          setAccounts(accs.data);
        } catch (accErr) {
          console.error("Accounts Fetch Error:", accErr);
        }
      }
    } catch (err) { 
      console.error("Customers Fetch Error:", err); 
      addToast("Failed to load customers. Check backend connection.", "error");
    }

    try {
      const resp = await axios.get('http://localhost:5000/api/branches');
      setBranches(resp.data);
    } catch (err) { 
      console.error("Branches Fetch Error (Possible 404):", err);
      // addToast("Branches API missing or 404. Restore backend route.", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    if (isNewCustomer) {
      if (!formData.name || !formData.email || !formData.dob) {
        addToast("Please fill in all mandatory customer details.", "error");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        addToast("Invalid email format.", "error");
        return false;
      }
      
      const birthYear = new Date(formData.dob).getFullYear();
      const currYear = new Date().getFullYear();
      if (birthYear < 1920 || birthYear > currYear - 1) {
        addToast("Please provide a valid birth year (1920 - Present).", "error");
        return false;
      }
    } else if (!formData.customer_id) {
      addToast("Please select an existing customer.", "error");
      return false;
    }

    if (!formData.branch_id) {
      addToast("Please select a branch (Ensure the server is running).", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let finalCustomerId = formData.customer_id;

      if (isNewCustomer) {
        const custResp = await axios.post('http://localhost:5000/api/customers', {
          name: formData.name, email: formData.email, phone: formData.phone,
          dob: formData.dob,
          perm_village: formData.perm_village, perm_district: formData.perm_district, 
          perm_city: formData.perm_city, perm_state: formData.perm_state, perm_pincode: formData.perm_pincode,
          temp_village: isSameAsPermanent ? formData.perm_village : formData.temp_village,
          temp_district: isSameAsPermanent ? formData.perm_district : formData.temp_district,
          temp_city: isSameAsPermanent ? formData.perm_city : formData.temp_city,
          temp_state: isSameAsPermanent ? formData.perm_state : formData.temp_state,
          temp_pincode: isSameAsPermanent ? formData.perm_pincode : formData.temp_pincode,
          gender: formData.gender, occupation: formData.occupation,
          annual_income: formData.annual_income, nationality: formData.nationality,
          kyc_document_type: formData.kyc_document_type, kyc_document_no: formData.kyc_document_no,
          kyc_status: 'Pending'
        });
        finalCustomerId = custResp.data.id;
      }

      await axios.post('http://localhost:5000/api/accounts', {
        customer_id: finalCustomerId,
        branch_id: formData.branch_id,
        account_type: formData.account_type,
        initial_balance: formData.initial_balance
      });

      addToast('Account created successfully!', 'success');
      setShowForm(false);
      setIsNewCustomer(false);
      setFormData({
        customer_id: '', branch_id: '', account_type: 'Savings', initial_balance: '0',
        name: '', email: '', phone: '', dob: '',
        perm_village: '', perm_district: '', perm_city: '', perm_state: '', perm_pincode: '',
        temp_village: '', temp_district: '', temp_city: '', temp_state: '', temp_pincode: '',
        profilePhoto: null, idProof: null, signature: null,
        gender: '', occupation: '', annual_income: '', nationality: 'Indian',
        kyc_document_type: '', kyc_document_no: ''
      });
      setIsSameAsPermanent(false);
      fetchData();
    } catch (err) {
      addToast('Error: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleAccountClick = async (acc) => {
    setSelectedAccount(acc);
    setLoadingTransactions(true);
    try {
      const resp = await axios.get(`http://localhost:5000/api/transactions/account/${acc.account_id}`);
      setSelectedTransactions(resp.data);
    } catch (err) {
      addToast("Failed to load transactions.", "error");
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Account Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Open New Account'}
        </button>
      </div>

      {showForm && (
        <form className="glass form-card" onSubmit={handleSubmit}>
          <div className="form-toggle-header">
            <h3>Open a New Bank Account</h3>
            <div className="toggle-group">
               <button 
                 type="button" 
                 className={`toggle-btn ${!isNewCustomer ? 'active' : ''}`}
                 onClick={() => setIsNewCustomer(false)}
               >
                 Existing
               </button>
               <button 
                 type="button" 
                 className={`toggle-btn ${isNewCustomer ? 'active' : ''}`}
                 onClick={() => setIsNewCustomer(true)}
               >
                 <UserPlus size={16} /> New Customer
               </button>
            </div>
          </div>

          <div className="form-grid">
            {isNewCustomer ? (
              <>
                <input type="text" placeholder="Full Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="Phone (10 digits)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input type="date" placeholder="DOB *" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                <div className="form-group-title full-width">Permanent Address</div>
                <input type="text" placeholder="Village/Area" value={formData.perm_village} onChange={e => setFormData({...formData, perm_village: e.target.value})} />
                <input type="text" placeholder="District" value={formData.perm_district} onChange={e => setFormData({...formData, perm_district: e.target.value})} />
                <input type="text" placeholder="City" value={formData.perm_city} onChange={e => setFormData({...formData, perm_city: e.target.value})} />
                <input type="text" placeholder="State" value={formData.perm_state} onChange={e => setFormData({...formData, perm_state: e.target.value})} />
                <input type="text" placeholder="Pincode" value={formData.perm_pincode} onChange={e => setFormData({...formData, perm_pincode: e.target.value})} />

                <div className="full-width address-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={isSameAsPermanent} 
                      onChange={e => setIsSameAsPermanent(e.target.checked)} 
                    />
                    Current address same as permanent address
                  </label>
                </div>

                {!isSameAsPermanent && (
                  <>
                    <div className="form-group-title full-width">Current Address</div>
                    <input type="text" placeholder="Village/Area" value={formData.temp_village} onChange={e => setFormData({...formData, temp_village: e.target.value})} />
                    <input type="text" placeholder="District" value={formData.temp_district} onChange={e => setFormData({...formData, temp_district: e.target.value})} />
                    <input type="text" placeholder="City" value={formData.temp_city} onChange={e => setFormData({...formData, temp_city: e.target.value})} />
                    <input type="text" placeholder="State" value={formData.temp_state} onChange={e => setFormData({...formData, temp_state: e.target.value})} />
                    <input type="text" placeholder="Pincode" value={formData.temp_pincode} onChange={e => setFormData({...formData, temp_pincode: e.target.value})} />
                  </>
                )}
                
                <div className="form-group-title full-width">Personal & Banking Details</div>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input type="text" placeholder="Occupation" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
                <input type="number" placeholder="Annual Income (₹)" value={formData.annual_income} onChange={e => setFormData({...formData, annual_income: e.target.value})} />
                <input type="text" placeholder="Nationality" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                
                <select value={formData.kyc_document_type} onChange={e => setFormData({...formData, kyc_document_type: e.target.value})}>
                  <option value="">KYC Document Type</option>
                  <option value="Aadhar">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
                <input type="text" placeholder="Document Number" value={formData.kyc_document_no} onChange={e => setFormData({...formData, kyc_document_no: e.target.value})} />

                <div className="kyc-section full-width visible">
                  <p>Digital KYC & Identity Verification</p>
                  <div className="kyc-inputs">
                    <div className="file-input">
                      <label><Image size={16} /> Profile Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setFormData({...formData, profilePhoto: e.target.files[0]})} 
                      />
                    </div>
                    <div className="file-input">
                      <label><FileCheck size={16} /> ID Proof (Self-Attested)</label>
                      <input 
                        type="file" 
                        onChange={e => setFormData({...formData, idProof: e.target.files[0]})} 
                      />
                    </div>
                    <div className="file-input full-width">
                      <label><Plus size={16} /> Digital Signature (Simulation)</label>
                      <input 
                        type="file" 
                        onChange={e => setFormData({...formData, signature: e.target.files[0]})} 
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                <option value="">Select Existing Customer</option>
                {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} (ID: {c.customer_id})</option>)}
              </select>
            )}
            
            <select required value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
            </select>
            <select value={formData.account_type} onChange={e => setFormData({...formData, account_type: e.target.value})}>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
            </select>
            <input type="number" placeholder="Initial Deposit (₹)" value={formData.initial_balance} onChange={e => setFormData({...formData, initial_balance: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary">Create Account</button>
        </form>
      )}

      <div className="account-list grid">
        {accounts.map(acc => (
          <div 
            key={acc.account_id} 
            className={`glass list-card account-card clickable ${selectedAccount?.account_id === acc.account_id ? 'selected' : ''}`}
            onClick={() => handleAccountClick(acc)}
          >
            <div className="card-header">
              <Landmark size={24} color="var(--accent)" />
              <span className="account-no">Acc No: 1000{5000 + acc.account_id}</span>
            </div>
            <div className="card-body">
              <span className="type-tag">{acc.account_type}</span>
              <h3 className="balance">₹{parseFloat(acc.balance).toLocaleString('en-IN')}</h3>
              <p className="status">Status: {acc.status}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedAccount && (
        <div className="modal-overlay" onClick={() => setSelectedAccount(null)}>
          <div className="glass modal-content detail-view" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Account Statement & Details</h3>
              <button className="close-btn" onClick={() => setSelectedAccount(null)}>&times;</button>
            </div>
            
            <div className="detail-grid">
              <div className="info-section">
                <h4>Customer Profile</h4>
                <div className="info-row"><span>Name:</span> {customers.find(c => c.customer_id === selectedAccount.customer_id)?.name}</div>
                <div className="info-row"><span>Account No:</span> 1000{5000 + selectedAccount.account_id}</div>
                <div className="info-row"><span>Type:</span> {selectedAccount.account_type}</div>
                <div className="info-row"><span>Balance:</span> ₹{parseFloat(selectedAccount.balance).toLocaleString('en-IN')}</div>
                <div className="info-row"><span>Status:</span> <span className={`status-tag ${selectedAccount.status.toLowerCase()}`}>{selectedAccount.status}</span></div>
              </div>

              <div className="transaction-section">
                <h4>Recent Transactions</h4>
                {loadingTransactions ? (
                  <p>Loading transactions...</p>
                ) : selectedTransactions.length > 0 ? (
                  <div className="mini-statement">
                    {selectedTransactions.map(tx => (
                      <div key={tx.transaction_id} className="tx-item">
                        <div className="tx-info">
                          <span className="tx-type">{tx.type}</span>
                          <span className="tx-date">{new Date(tx.timestamp).toLocaleDateString()}</span>
                        </div>
                        <span className={`tx-amount ${tx.type === 'Deposit' ? 'text-success' : 'text-danger'}`}>
                          {tx.type === 'Deposit' ? '+' : '-'}₹{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No recent transactions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
