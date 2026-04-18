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

// 2. Issue New Card
router.post('/cards/issue', async (req, res) => {
    try {
        const { customer_id, account_id, type } = req.body;
        
        // Generate Mock Card Data
        const cardNumber = Array.from({length: 16}, () => Math.floor(Math.random() * 10)).join('');
        const cvv = Array.from({length: 3}, () => Math.floor(Math.random() * 10)).join('');
        
        const date = new Date();
        const expiryMonth = String(date.getMonth() + 1).padStart(2, '0');
        const expiryYear = String(date.getFullYear() + 5).slice(-2);
        const expiryDate = `${expiryMonth}/${expiryYear}`;

        const [result] = await db.execute(
            'INSERT INTO Cards (customer_id, account_id, card_number, expiry_date, cvv, type) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_id, account_id, cardNumber, expiryDate, cvv, type || 'Debit']
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
        const { customer_id, loan_type, principal, interest_rate, term_months } = req.body;

        const [result] = await db.execute(
            'INSERT INTO Loans (customer_id, loan_type, principal, interest_rate, term_months) VALUES (?, ?, ?, ?, ?)',
            [customer_id, loan_type, principal, interest_rate, term_months]
        );
        res.status(201).json({ message: 'Loan application submitted successfully', loanId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
