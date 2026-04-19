const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Get all FDs for a customer
router.get('/:customerId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM FixedDeposits WHERE customer_id = ? ORDER BY created_at DESC', [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Book a new FD
router.post('/book', async (req, res) => {
    try {
        const { customer_id, linked_account_id, principal_amount, duration_months, interest_rate } = req.body;

        // Verify account has enough balance
        const [accounts] = await db.execute('SELECT balance FROM Accounts WHERE account_id = ? AND customer_id = ?', [linked_account_id, customer_id]);
        if (accounts.length === 0) return res.status(404).json({ error: 'Account not found' });
        if (parseFloat(accounts[0].balance) < parseFloat(principal_amount)) {
            return res.status(400).json({ error: 'Insufficient balance to book FD' });
        }

        // Calculate Maturity Amount: A = P(1 + r/n)^(nt) ... we'll use simple compound A = P * (1 + (R/100) * (T_months/12))
        // Since FDs usually compound quarterly, we will approximate for capstone:
        const rate = parseFloat(interest_rate) / 100;
        const timeYears = parseInt(duration_months) / 12;
        const maturityAmount = parseFloat(principal_amount) * Math.pow((1 + rate/4), 4 * timeYears);

        // Dates
        const startDate = new Date();
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + parseInt(duration_months));

        // Format dates to YYYY-MM-DD for MySQL
        const formatDate = (date) => date.toISOString().split('T')[0];

        // 1. Deduct Principal from balance
        await db.execute('UPDATE Accounts SET balance = balance - ? WHERE account_id = ?', [principal_amount, linked_account_id]);

        // 2. Log withdrawal
        await db.execute(
            'INSERT INTO Transactions (from_account_id, amount, type, description) VALUES (?, ?, ?, ?)',
            [linked_account_id, principal_amount, 'Withdrawal', `FD Booking Transfer (Tenure: ${duration_months} Months)`]
        );

        // 3. Create FD Record
        const [result] = await db.execute(
            `INSERT INTO FixedDeposits 
            (customer_id, linked_account_id, principal_amount, interest_rate, duration_months, maturity_amount, start_date, maturity_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer_id, linked_account_id, principal_amount, interest_rate, duration_months, maturityAmount, formatDate(startDate), formatDate(maturityDate)]
        );

        res.status(201).json({ message: 'Fixed Deposit successfully booked', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
