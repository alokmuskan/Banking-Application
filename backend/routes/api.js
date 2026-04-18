const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- Customer APIs ---

// 1. Create Customer
router.post('/customers', async (req, res) => {
    try {
        const { 
            name, email, phone, address, dob, 
            gender, occupation, annual_income, nationality, 
            kyc_document_type, kyc_document_no 
        } = req.body;

        // --- VALIDATION ---
        
        // 1. Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // 2. Phone number check (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (phone && !phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
        }

        // 3. Date of Birth check
        const birthDate = new Date(dob);
        const birthYear = birthDate.getFullYear();
        const currentYear = new Date().getFullYear();

        if (birthDate > new Date() || birthYear < 1900 || birthYear > currentYear) {
            return res.status(400).json({ error: 'Please provide a valid Date of Birth' });
        }

        // 4. Duplicate Email check
        const [existing] = await db.execute('SELECT email FROM Customers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        const [result] = await db.execute(
            'INSERT INTO Customers (name, email, phone, address, dob, gender, occupation, annual_income, nationality, kyc_document_type, kyc_document_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, address, dob, gender, occupation, annual_income, nationality || 'Indian', kyc_document_type, kyc_document_no]
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
            'SELECT * FROM Transactions ORDER BY timestamp DESC LIMIT 20'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 10. Get Branch List
router.get('/branches', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Branches');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
