// models/payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: { type: String},
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  method: { type: String, required: true },  
  date: { type: Date, default: Date.now },  
  paymentGateway: { type: String, default: 'PayHere' },
  transactionId: { type: String, unique: true }
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
