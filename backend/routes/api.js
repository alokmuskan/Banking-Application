const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- Customer APIs ---

// 1. Create Customer
router.post('/customers', async (req, res) => {
    try {
        const { 
            name, email, phone, dob, 
            perm_village, perm_district, perm_city, perm_state, perm_pincode,
            temp_village, temp_district, temp_city, temp_state, temp_pincode,
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
            `INSERT INTO Customers (
                name, email, phone, dob, 
                perm_village, perm_district, perm_city, perm_state, perm_pincode,
                temp_village, temp_district, temp_city, temp_state, temp_pincode,
                gender, occupation, annual_income, nationality, 
                kyc_document_type, kyc_document_no
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name || null, email || null, phone || null, dob || null, 
                perm_village || null, perm_district || null, perm_city || null, perm_state || null, perm_pincode || null,
                temp_village || null, temp_district || null, temp_city || null, temp_state || null, temp_pincode || null,
                gender || null, occupation || null, annual_income || null, nationality || 'Indian', 
                kyc_document_type || null, kyc_document_no || null
            ]
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
        const { customer_id, branch_id, account_type, initial_balance, initial_deposit } = req.body;
        const balance = initial_balance || initial_deposit || 0;
        const [result] = await db.execute(
            'INSERT INTO Accounts (customer_id, branch_id, account_type, balance, open_date) VALUES (?, ?, ?, ?, CURDATE())',
            [customer_id || null, branch_id || null, account_type, balance]
        );
        res.status(201).json({ message: 'Account created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all accounts (for admin AccountPage)
router.get('/accounts', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT a.*, c.name, c.email, b.branch_name
             FROM Accounts a
             LEFT JOIN Customers c ON a.customer_id = c.customer_id
             LEFT JOIN Branches b ON a.branch_id = b.branch_id
             ORDER BY a.account_id DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET accounts by customer (join with customer name for display)
router.get('/accounts/customer/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT a.*, c.name as customer_name
             FROM Accounts a
             LEFT JOIN Customers c ON a.customer_id = c.customer_id
             WHERE a.customer_id = ?`,
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- Beneficiary APIs ---

// Add Beneficiary
router.post('/beneficiaries/add', async (req, res) => {
    try {
        const { customer_id, payee_name, payee_account_no, bank_name, ifsc_code } = req.body;
        
        // Prevent adding own account (optional logic but good practice)
        const [ownAccounts] = await db.execute('SELECT * FROM Accounts WHERE customer_id = ? AND account_id = ?', [customer_id, payee_account_no]);
        if (ownAccounts.length > 0) {
            return res.status(400).json({ error: 'Cannot add your own account as a beneficiary.' });
        }

        const [result] = await db.execute(
            'INSERT INTO Beneficiaries (customer_id, payee_name, payee_account_no, bank_name, ifsc_code) VALUES (?, ?, ?, ?, ?)',
            [customer_id, payee_name, payee_account_no, bank_name || 'NexusBank', ifsc_code]
        );
        res.status(201).json({ message: 'Beneficiary added successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Beneficiaries by Customer
router.get('/beneficiaries/:customerId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Beneficiaries WHERE customer_id = ? AND status = "Active"', [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Request Account (Customer Portal)
router.post('/accounts/request', async (req, res) => {
    try {
        const { customer_id, branch_id, account_type } = req.body;
        const [result] = await db.execute(
            'INSERT INTO Accounts (customer_id, branch_id, account_type, status, open_date) VALUES (?, ?, ?, "Pending", CURDATE())',
            [customer_id, branch_id, account_type]
        );
        res.status(201).json({ message: 'Account request submitted', account_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Deposit / Withdrawal / Transfer (Unified Handler)
router.post('/transactions', async (req, res) => {
    let { from_account_id, to_account_id, amount, type, description } = req.body;

    try {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'A valid positive amount is required' });
        }

        if (type === 'Transfer') {
            if (!from_account_id || !to_account_id) {
                return res.status(400).json({ error: 'Both source account and beneficiary are required for transfer' });
            }

            // Verify source account exists
            const [accountInfo] = await db.execute('SELECT customer_id FROM Accounts WHERE account_id = ?', [from_account_id]);
            if (accountInfo.length === 0) return res.status(404).json({ error: 'Source account not found' });

            const customerId = accountInfo[0].customer_id;

            // Resolve beneficiary — to_account_id is the payee_account_no stored in Beneficiaries
            const [ben] = await db.execute(
                'SELECT * FROM Beneficiaries WHERE customer_id = ? AND payee_account_no = ? AND status = "Active"',
                [customerId, String(to_account_id)]
            );
            if (ben.length === 0) {
                return res.status(400).json({ error: 'Destination account is not a registered beneficiary.' });
            }

            // Resolve the actual account_id from the Accounts table using payee_account_no
            let targetAccId = parseInt(ben[0].payee_account_no, 10);
            if (targetAccId > 10005000) {
                targetAccId -= 10005000;
            }
            
            const [destAcc] = await db.execute('SELECT account_id FROM Accounts WHERE account_id = ? OR account_id = ?', [ben[0].payee_account_no, targetAccId]);
            if (destAcc.length > 0) {
                to_account_id = destAcc[0].account_id;
            } else {
                // If no matching account in DB (external bank), we must set it to null to avoid foreign key failure 
                // and push details to the description
                to_account_id = null;
                description = `Transferred to ${ben[0].payee_name} (${ben[0].bank_name} - ${ben[0].payee_account_no}) ` + (description || '');
            }
        }

        if (type === 'Withdrawal') {
            if (!from_account_id) return res.status(400).json({ error: 'Source account is required for withdrawal' });
        }

        // Insert — DB triggers handle balance deduction and insufficient-funds guard
        const [result] = await db.execute(
            'INSERT INTO Transactions (from_account_id, to_account_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
            [from_account_id || null, to_account_id || null, amount, type, description || null]
        );

        // Generate notification
        if (from_account_id) {
            try {
                const [accInfo] = await db.execute('SELECT customer_id FROM Accounts WHERE account_id = ?', [from_account_id]);
                if (accInfo.length > 0) {
                    const cId = accInfo[0].customer_id;
                    const amountStr = `₹${parseFloat(amount).toLocaleString('en-IN')}`;
                    await db.execute(
                        'INSERT INTO Notifications (customer_id, title, message) VALUES (?, ?, ?)',
                        [cId, `Transaction Alert: ${type}`, `Your ${type} of ${amountStr} was processed successfully.`]
                    );
                }
            } catch (notifErr) { console.error('Notification Error:', notifErr); }
        }

        res.status(201).json({ message: 'Transaction processed successfully', id: result.insertId });
    } catch (error) {
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

// 10. Get Spending Analytics (Last 6 Months)
router.get('/analytics/spending/:accountId', async (req, res) => {
    try {
        const accId = req.params.accountId;
        // Fetch last 6 months data
        const [rows] = await db.execute(`
            SELECT 
                DATE_FORMAT(timestamp, '%b') as month_name,
                MONTH(timestamp) as month_num,
                YEAR(timestamp) as year_num,
                type,
                SUM(amount) as total
            FROM Transactions
            WHERE (from_account_id = ? OR to_account_id = ?)
              AND timestamp >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY year_num, month_num, month_name, type
            ORDER BY year_num ASC, month_num ASC
        `, [accId, accId]);

        // Process data into format required by recharts: [{ name: 'Jan', income: 4000, expense: 2400 }]
        const chartDataMap = new Map();
        
        rows.forEach(row => {
            const key = `${row.month_name}`;
            if (!chartDataMap.has(key)) {
                chartDataMap.set(key, { name: key, income: 0, expense: 0 });
            }
            const monthData = chartDataMap.get(key);
            
            // "Deposit" or "Transfer" into account is income
            // "Withdrawal" or "Transfer" out of account is expense
            // SQL doesn't differentiate transfer IN vs OUT by type name alone (both are 'Transfer')
            // So we need to calculate it properly. Actually our group by 'type' is flawed for Transfers.
        });

        // Let's do a better query that categorizes IN vs OUT relative to the account
        const [preciseRows] = await db.execute(`
            SELECT 
                DATE_FORMAT(timestamp, '%b') as month_name,
                MONTH(timestamp) as month_num,
                YEAR(timestamp) as year_num,
                CASE 
                    WHEN to_account_id = ? THEN 'income'
                    WHEN from_account_id = ? THEN 'expense'
                END as cashflow_type,
                SUM(amount) as total
            FROM Transactions
            WHERE (from_account_id = ? OR to_account_id = ?)
              AND timestamp >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY year_num, month_num, month_name, cashflow_type
            ORDER BY year_num ASC, month_num ASC
        `, [accId, accId, accId, accId]);

        // PRE-FILL 6 months of empty data so graphs never break geometry
        const monthsMap = new Map();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('en-US', { month: 'short' });
            // Handle edge case of duplicate names if we cross year boundaries without year label
            // For safety, just use 'MMM' as requested by chart.
            if (!monthsMap.has(monthName)) {
                 monthsMap.set(monthName, { name: monthName, income: 0, expense: 0 });
            }
        }

        preciseRows.forEach(row => {
            const key = `${row.month_name}`;
            if (monthsMap.has(key)) {
                if (row.cashflow_type === 'income') {
                    monthsMap.get(key).income += parseFloat(row.total);
                } else if (row.cashflow_type === 'expense') {
                    monthsMap.get(key).expense += parseFloat(row.total);
                }
            }
        });

        res.json(Array.from(monthsMap.values()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 11. Get Transaction Classification for Pie Chart
router.get('/analytics/distribution/:accountId', async (req, res) => {
    try {
        const accId = req.params.accountId;
        const [rows] = await db.execute(`
            SELECT type as name, SUM(amount) as value 
            FROM Transactions 
            WHERE from_account_id = ? OR to_account_id = ?
            GROUP BY type
        `, [accId, accId]);

        // Default colors for charting based on type
        const colors = {
            'Deposit': '#10b981', // green
            'Withdrawal': '#ef4444', // red
            'Transfer': '#8b5cf6'  // purple
        };

        const chartData = rows.map(r => ({
            name: r.name,
            value: parseFloat(r.value),
            color: colors[r.name] || '#3b82f6'
        }));

        res.json(chartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 12. Get Branch List
router.get('/branches', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Branches');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
