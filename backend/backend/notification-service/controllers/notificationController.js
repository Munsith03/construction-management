import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Notification from '../models/notificationModel.js';

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendNotification = async (req, res) => {
  const { orderId, customerEmail, customerPhone } = req.body;

  let emailStatus = 'sent';
  let smsStatus = 'sent';
  let errorMessage = null;

  try {
    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: 'Order Confirmation',
      text: `Your order ${orderId} has been placed successfully!`,
    });

    // Send SMS
    await twilioClient.messages.create({
      body: `Your order ${orderId} has been placed!`,
      from: process.env.TWILIO_PHONE,
      to: customerPhone,
    });

    // Save success to DB
    await Notification.create({
      orderId,
      customerEmail,
      customerPhone,
      emailStatus,
      smsStatus,
    });

    res.json({ message: 'Notifications sent' });
  } catch (err) {
    // Update status and save to DB on failure
    emailStatus = 'failed';
    smsStatus = 'failed';
    errorMessage = err.message;

    await Notification.create({
      orderId,
      customerEmail,
      customerPhone,
      emailStatus,
      smsStatus,
      errorMessage,
    });

    res.status(500).json({ message: err.message });
  }
};
