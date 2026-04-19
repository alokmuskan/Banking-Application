import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PiggyBank, Calculator, FileCheck, History } from 'lucide-react';
import '../styles/Pages.css';

const LoansPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [emi, setEmi] = useState(0);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const fetchCustomerLoans = async (targetCustomerId) => {
    try {
      const resp = await axios.get(`http://localhost:5000/api/loans/customer/${targetCustomerId}`);
      setLoans(resp.data);
    } catch (err) {
      console.error(err);
      setLoans([]);
    }
  };

  const fetchInitialData = async () => {
    try {
      if (user?.role === 'customer' && user?.customerId) {
        fetchCustomerLoans(user.customerId);
      } else {
        const custResp = await axios.get('http://localhost:5000/api/customers');
        setCustomers(custResp.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
      if (selectedCustomerId) {
          fetchCustomerLoans(selectedCustomerId);
      } else if (user?.role !== 'customer') {
          setLoans([]);
      }
  }, [selectedCustomerId]);

  // EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  // r = monthly interest rate
  // n = total months
  useEffect(() => {
    const P = loanAmount;
    const r = (interestRate / 12) / 100;
    const n = tenureYears * 12;
    
    if (P > 0 && r > 0 && n > 0) {
        const emiValue = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setEmi(emiValue);
    } else {
        setEmi(0);
    }
  }, [loanAmount, interestRate, tenureYears]);

  const applyForLoan = async () => {
      const targetUserId = user?.role === 'customer' ? user?.customerId : selectedCustomerId;
      const directStatus = user?.role === 'customer' ? 'Pending' : 'Active';

      if (!targetUserId) return addToast('Please select a customer first.', 'error');

      setLoading(true);
      try {
          await axios.post('http://localhost:5000/api/loans/apply', {
              customer_id: targetUserId,
              loan_type: 'Personal Loan', // Simplification for now
              principal: loanAmount,
              interest_rate: interestRate,
              term_months: tenureYears * 12,
              status: directStatus
          });
          addToast(`Loan ${directStatus === 'Active' ? 'Granted' : 'Application Submitted'} Successfully!`, 'success');
          fetchCustomerLoans(targetUserId);
      } catch (err) {
          addToast(err.response?.data?.error || 'Failed to process loan', 'error');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{user?.role === 'customer' ? 'Loans Center' : 'Loan Origination Terminal'}</h2>
        <p>{user?.role === 'customer' ? 'Calculate EMIs and apply for personal loans instantly.' : 'Configure loan terms and instantly grant credit to customers.'}</p>
      </div>

      {user?.role !== 'customer' && (
          <div className="glass" style={{padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem'}}>
             <h3><FileCheck size={20} color="var(--accent)" style={{marginRight: '0.5rem'}}/> Select Target Customer</h3>
             <select className="form-control" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} style={{background: 'var(--bg-tertiary)', marginTop: '1rem', width: '100%', maxWidth: '400px'}}>
                 <option value="">-- Select Customer --</option>
                 {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.email})</option>)}
             </select>
          </div>
      )}

      <div className="cards-grid">
        
        {/* EMI Calculator */}
        <div className="emi-calculator glass">
            <div className="card-header">
                <h3><Calculator size={20} color="var(--accent)" /> EMI Calculator</h3>
            </div>
            
            <div className="calc-body">
                <div className="slider-group">
                    <div className="slider-header">
                        <label>Loan Amount</label>
                        <span>₹{Number(loanAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <input 
                        type="range" min="10000" max="5000000" step="10000" 
                        value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} 
                        className="range-slider"
                    />
                </div>

                <div className="slider-group">
                    <div className="slider-header">
                        <label>Interest Rate (p.a)</label>
                        <span>{interestRate}%</span>
                    </div>
                    <input 
                        type="range" min="5" max="25" step="0.5" 
                        value={interestRate} onChange={(e) => setInterestRate(e.target.value)} 
                        className="range-slider"
                    />
                </div>

                <div className="slider-group">
                    <div className="slider-header">
                        <label>Tenure (Years)</label>
                        <span>{tenureYears} Years</span>
                    </div>
                    <input 
                        type="range" min="1" max="30" step="1" 
                        value={tenureYears} onChange={(e) => setTenureYears(e.target.value)} 
                        className="range-slider"
                    />
                </div>
            </div>

            <div className="emi-result">
                <h4>Monthly EMI</h4>
                <div className="emi-amount">₹{Math.round(emi).toLocaleString('en-IN')}</div>
                <div className="emi-total-interest">
                    Total Interest: ₹{Math.round((emi * tenureYears * 12) - loanAmount).toLocaleString('en-IN')}
                </div>
            </div>
            
            {((user?.role === 'customer') || (user?.role !== 'customer' && selectedCustomerId)) && (
                <button className="btn-primary full-width" onClick={applyForLoan} disabled={loading} style={{marginTop: '1.5rem'}}>
                    {loading ? 'Processing...' : (user?.role === 'customer' ? 'Apply for this Loan' : 'Grant this Loan')}
                </button>
            )}
        </div>

        {/* Existing Loans */}
        <div className="loans-list-container">
            <div className="card-header" style={{marginBottom: '1rem'}}>
                <h3><History size={20} color="var(--text-secondary)" /> {user?.role === 'customer' ? 'My Applications' : 'Customer Loans'}</h3>
            </div>
            <div className="loans-list">
                {loans.length > 0 ? loans.map(loan => (
                    <div key={loan.id} className="loan-card glass">
                        <div className="loan-header">
                            <div>
                                <h4>{loan.loan_type}</h4>
                                <span className="loan-date">{new Date(loan.application_date).toLocaleDateString()}</span>
                            </div>
                            <span className={`status-tag ${loan.status.toLowerCase()}`}>{loan.status}</span>
                        </div>
                        <div className="loan-details">
                            <div className="detail-col">
                                <span>Principal</span>
                                <strong>₹{parseFloat(loan.principal).toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="detail-col">
                                <span>Interest</span>
                                <strong>{loan.interest_rate}%</strong>
                            </div>
                            <div className="detail-col">
                                <span>Tenure</span>
                                <strong>{loan.term_months} Mo</strong>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="no-data glass" style={{padding: '3rem'}}>
                        <PiggyBank size={48} color="var(--border)" style={{marginBottom: '1rem'}} />
                        <p>{user?.role === 'customer' ? 'You have no active loans or applications.' : 'This customer has no loan portfolio.'}</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoansPage;
