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

  const fetchData = async () => {
    if (!user?.customerId) return;
    try {
      const resp = await axios.get(`http://localhost:5000/api/loans/customer/${user.customerId}`);
      setLoans(resp.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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
      setLoading(true);
      try {
          await axios.post('http://localhost:5000/api/loans/apply', {
              customer_id: user.customerId,
              loan_type: 'Personal Loan', // Simplification for now
              principal: loanAmount,
              interest_rate: interestRate,
              term_months: tenureYears * 12
          });
          addToast('Loan Application Submitted! Pending Approval.', 'success');
          fetchData();
      } catch (err) {
          addToast(err.response?.data?.error || 'Application Failed', 'error');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Loans Center</h2>
        <p>Calculate EMIs and apply for personal loans instantly.</p>
      </div>

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
            
            <button className="btn-primary full-width" onClick={applyForLoan} disabled={loading} style={{marginTop: '1.5rem'}}>
                {loading ? 'Submitting...' : 'Apply for this Loan'}
            </button>
        </div>

        {/* Existing Loans */}
        <div className="loans-list-container">
            <div className="card-header" style={{marginBottom: '1rem'}}>
                <h3><History size={20} color="var(--text-secondary)" /> My Applications</h3>
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
                        <p>You have no active loans or applications.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoansPage;
