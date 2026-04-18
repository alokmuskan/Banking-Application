const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- ADMIN APPROVALS APIs ---

// 1. Get all pending requests
router.get('/approvals', async (req, res) => {
    try {
        const [accounts] = await db.execute(`
            SELECT a.*, c.name as customer_name 
            FROM Accounts a 
            JOIN Customers c ON a.customer_id = c.customer_id 
            WHERE a.status = 'Pending'
        `);
        
        const [cards] = await db.execute(`
            SELECT ca.*, c.name as customer_name 
            FROM Cards ca 
            JOIN Customers c ON ca.customer_id = c.customer_id 
            WHERE ca.status = 'Pending'
        `);
        
        const [loans] = await db.execute(`
            SELECT l.*, c.name as customer_name 
            FROM Loans l 
            JOIN Customers c ON l.customer_id = c.customer_id 
            WHERE l.status = 'Pending'
        `);

        res.json({ accounts, cards, loans });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Approve/Reject an item
// :type can be 'account', 'card', 'loan'
router.put('/approvals/:type/:id', async (req, res) => {
    const { status } = req.body; // e.g., 'Active', 'Approved', 'Rejected'
    const { type, id } = req.params;

    let tableName = '';
    let idColumn = '';

    if (type === 'account') {
        tableName = 'Accounts';
        idColumn = 'account_id';
    } else if (type === 'card') {
        tableName = 'Cards';
        idColumn = 'id';
    } else if (type === 'loan') {
        tableName = 'Loans';
        idColumn = 'id';
    } else {
        return res.status(400).json({ error: 'Invalid approval type' });
    }

    try {
        await db.execute(`UPDATE ${tableName} SET status = ? WHERE ${idColumn} = ?`, [status, id]);
        
        // Optional: Generate notification for the user
        let customerIdResult;
        if(type === 'account') {
            [customerIdResult] = await db.execute('SELECT customer_id FROM Accounts WHERE account_id = ?', [id]);
        } else if (type === 'card') {
            [customerIdResult] = await db.execute('SELECT customer_id FROM Cards WHERE id = ?', [id]);
        } else {
            [customerIdResult] = await db.execute('SELECT customer_id FROM Loans WHERE id = ?', [id]);
        }

        if (customerIdResult && customerIdResult.length > 0) {
           const cuid = customerIdResult[0].customer_id;
           await db.execute(
               'INSERT INTO Notifications (customer_id, title, message) VALUES (?, ?, ?)',
               [cuid, `Update on your ${type} request`, `Your request has been ${status}.`]
           );
        }

        res.json({ message: `${type} status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
