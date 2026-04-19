const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Check if keys are provided, if not use a dummy fallback so server doesn't crash on boot
const razorpayInstance = process.env.RAZORPAY_KEY_ID ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
}) : null;

// 1. Create Order
router.post('/create-order', async (req, res) => {
    try {
        if (!razorpayInstance) {
            return res.status(500).json({ error: 'Razorpay keys not configured in backend/.env' });
        }

        const { amount, currency = 'INR' } = req.body;

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create Razorpay Order' });
    }
});

// 2. Verify Payment & Update Database
router.post('/verify', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            account_id,
            amount 
        } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET;

        // Verify cryptographic signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return res.status(400).json({ error: 'Transaction not legitimate!' });
        }

        // Successfully verified - Formally inject transaction logic into database
        // In Razorpay, the amount is in paise, but our DB expects rupees, so ensure amount is correct
        
        const type = 'Deposit';
        const description = `Razorpay UPI/Card Deposit (Txn ID: ${razorpay_payment_id})`;

        // 1. Insert Transaction Log
        const [result] = await db.execute(
            'INSERT INTO Transactions (to_account_id, amount, type, description) VALUES (?, ?, ?, ?)',
            [account_id, amount, type, description]
        );

        // 2. Actually update the account balance!
        await db.execute(
            'UPDATE Accounts SET balance = balance + ? WHERE account_id = ?',
            [parseFloat(amount), account_id]
        );

        res.json({ 
            message: 'Payment verified and deposited successfully',
            transaction_id: result.insertId 
        });

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

module.exports = router;
