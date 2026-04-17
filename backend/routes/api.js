const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- Customer APIs ---

// 1. Create Customer
router.post('/customers', async (req, res) => {
    try {
        const { name, email, phone, address, dob } = req.body;
        const [result] = await db.execute(
            'INSERT INTO Customers (name, email, phone, address, dob) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, address, dob]
        );
        res.status(201).json({ message: 'Customer created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get All Customers
router.get('/customers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Customers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- Account APIs ---

// 3. Create Account
router.post('/accounts', async (req, res) => {
    try {
        const { customer_id, branch_id, account_type, initial_balance } = req.body;
        const [result] = await db.execute(
            'INSERT INTO Accounts (customer_id, branch_id, account_type, balance, open_date) VALUES (?, ?, ?, ?, CURDATE())',
            [customer_id, branch_id, account_type, initial_balance || 0]
        );
        res.status(201).json({ message: 'Account created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Get Accounts by Customer
router.get('/accounts/customer/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Accounts WHERE customer_id = ?', [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- Transaction APIs ---

// 5. Deposit / Withdrawal / Transfer (Unified Handler)
router.post('/transactions', async (req, res) => {
    const { from_account_id, to_account_id, amount, type, description } = req.body;
    
    try {
        // Validation for Transfer
        if (type === 'Transfer' && (!from_account_id || !to_account_id)) {
            return res.status(400).json({ error: 'Both accounts are required for transfer' });
        }

        // We use a single INSERT. Our database triggers will handle balance updates and insufficient funds check.
        const [result] = await db.execute(
            'INSERT INTO Transactions (from_account_id, to_account_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
            [from_account_id || null, to_account_id || null, amount, type, description]
        );

        res.status(201).json({ 
            message: 'Transaction processed successfully', 
            id: result.insertId 
        });
    } catch (error) {
        // If the balance-check trigger fails, it throws a SQLSTATE 45000 which we catch here
        res.status(400).json({ error: error.message });
    }
});

// 6. Get Transaction History
router.get('/transactions/account/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM Transactions WHERE from_account_id = ? OR to_account_id = ? ORDER BY timestamp DESC',
            [req.params.id, req.params.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Dashboard & Analytics APIs ---

// 8. Get Dashboard Stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [[{customerCount}]] = await db.query('SELECT COUNT(*) as customerCount FROM Customers');
        const [[{accountCount}]] = await db.query('SELECT COUNT(*) as accountCount FROM Accounts');
        const [[{branchCount}]] = await db.query('SELECT COUNT(*) as branchCount FROM Branches');
        const [[{totalBalance}]] = await db.query('SELECT SUM(balance) as totalBalance FROM Accounts');

        res.json({
            customers: customerCount,
            accounts: accountCount,
            branches: branchCount,
            totalDeposits: totalBalance || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Get Global Recent Transactions
router.get('/transactions/global/recent', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM Transactions ORDER BY timestamp DESC LIMIT 10'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
