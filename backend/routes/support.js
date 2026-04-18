const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- NOTIFICATIONS APIs ---

// 1. Get Unread Notifications
router.get('/notifications/:customerId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Notifications WHERE customer_id = ? ORDER BY created_at DESC', [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Mark Notification as Read
router.put('/notifications/:id/read', async (req, res) => {
    try {
        await db.execute('UPDATE Notifications SET is_read = true WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SUPPORT TICKETS APIs ---

// 1. Submit a Support Ticket
router.post('/tickets', async (req, res) => {
    try {
        const { customer_id, subject, category, description } = req.body;
        const [result] = await db.execute(
            'INSERT INTO SupportTickets (customer_id, subject, category, description) VALUES (?, ?, ?, ?)',
            [customer_id, subject, category, description]
        );
        res.status(201).json({ message: 'Ticket submitted successfully', ticketId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get Tickets by Customer
router.get('/tickets/:customerId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM SupportTickets WHERE customer_id = ? ORDER BY created_at DESC', [req.params.customerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
