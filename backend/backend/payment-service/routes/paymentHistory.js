// routes/paymentHistory.js
import express from 'express';
import Payment from '../models/payment.js';

const router = express.Router();

// Get all payment records
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 }); // Sort by date descending
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payment records' });
  }
});

export default router;
