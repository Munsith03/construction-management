import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['assigned', 'in_transit', 'delivered'],
    default: 'assigned',
  },
  location: { type: String }, // Simplified for assignment scope
});

export default mongoose.model('Delivery', deliverySchema);