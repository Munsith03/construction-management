import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    emailStatus: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
    },
    smsStatus: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
