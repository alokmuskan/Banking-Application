const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- CARDS APIs ---

// 1. Get Cards by Customer
router.get('/cards/customer/:customerId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Cards WHERE customer_id = ? ORDER BY issue_date DESC', [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1.5 Get All Cards (Admin)
router.get('/cards', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Cards ORDER BY issue_date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Issue New Card
router.post('/cards/issue', async (req, res) => {
    try {
        const { customer_id, account_id, type, status } = req.body;
        
        // Generate Mock Card Data
        const cardNumber = Array.from({length: 16}, () => Math.floor(Math.random() * 10)).join('');
        const cvv = Array.from({length: 3}, () => Math.floor(Math.random() * 10)).join('');
        
        const date = new Date();
        const expiryMonth = String(date.getMonth() + 1).padStart(2, '0');
        const expiryYear = String(date.getFullYear() + 5).slice(-2);
        const expiryDate = `${expiryMonth}/${expiryYear}`;

        const [result] = await db.execute(
            'INSERT INTO Cards (customer_id, account_id, card_number, expiry_date, cvv, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customer_id, account_id, cardNumber, expiryDate, cvv, type || 'Debit', status || 'Pending']
        );
        res.status(201).json({ message: 'Card issued successfully', cardId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Update Card Status (Block/Active)
router.put('/cards/:cardId/status', async (req, res) => {
    try {
        const { status } = req.body;
        await db.execute('UPDATE Cards SET status = ? WHERE id = ?', [status, req.params.cardId]);
        res.json({ message: 'Card status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- LOANS APIs ---

// 1. Get Loans by Customer
router.get('/loans/customer/:customerId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Loans WHERE customer_id = ? ORDER BY application_date DESC', [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Apply for Loan
router.post('/loans/apply', async (req, res) => {
    try {
        const { customer_id, loan_type, amount, principal, interest_rate, tenure_months, term_months, status } = req.body;

        // Accept either naming convention from frontend
        const loanPrincipal = principal || amount;
        const loanTenure    = term_months || tenure_months;

        if (!customer_id)    return res.status(400).json({ error: 'customer_id is required' });
        if (!loanPrincipal)  return res.status(400).json({ error: 'Loan amount is required' });
        if (!loanTenure)     return res.status(400).json({ error: 'Loan tenure is required' });

        const [result] = await db.execute(
            'INSERT INTO Loans (customer_id, loan_type, principal, interest_rate, term_months, status) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_id, loan_type || 'Personal Loan', loanPrincipal, interest_rate || 8.5, loanTenure, status || 'Pending']
        );
        res.status(201).json({ message: 'Loan application submitted successfully', loanId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
