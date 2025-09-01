import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({

  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  method: {
    type: String,
    default: 'PayHere',
  },
  payhereReferenceId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;