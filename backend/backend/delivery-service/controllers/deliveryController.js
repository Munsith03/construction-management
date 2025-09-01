import Delivery from '../models/Delivery.js';
import { io } from '../index.js';
import axios from 'axios';

// Assign Delivery
export const assignDelivery = async (req, res) => {
  const { orderId } = req.body;

  try {
    // Step 1: Validate order status via Order Service
    const readyOrdersResponse = await axios.get(
      'http://localhost:3003/api/orders/ready'
      // {
      //   headers: { Authorization: req.header('Authorization') },
      // }
    );

    const readyOrders = readyOrdersResponse.data;
    const order = readyOrders.find((o) => o._id === orderId);

    if (!order) {
      return res
        .status(400)
        .json({ message: 'Order not ready for pickup or not found' });
    }

    // Step 2: Check if delivery already exists (without upsert)
    const existingDelivery = await Delivery.findOne({ order: orderId });

    if (existingDelivery) {
      return res.status(400).json({ message: 'Order already assigned' });
    }

    // Step 3: Create delivery record
    const delivery = new Delivery({
      order: orderId,
      driver: '67fe8ac2ef707d93f35bab1f', // From JWT
      location: 'Restaurant',
      status: 'assigned',
    });

    await delivery.save();

    // Step 4: Notify customer
    try {
      const customerResponse = await axios.get(
        `http://localhost:3001/api/users/${order.customer._id}`
      );

      const { email, phone } = customerResponse.data;

      await axios.post(
        'http://localhost:3000/api/notifications/send',
        {
          orderId,
          customerEmail: email || 'customer@example.com',
          customerPhone: phone || '+94771234567',
          message: `Your order ${orderId} has been assigned to a delivery driver.`,
        },
        {
          headers: { Authorization: req.header('Authorization') },
        }
      );
    } catch (notifyErr) {
      console.error('Notification failed:', notifyErr.message);
      // Continue without blocking delivery creation
    }

    io.emit('deliveryAssigned', delivery);
    return res.status(201).json(delivery);
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Something went wrong. Please try again.' });
  }
};

// Update Delivery Status
export const updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  console.log('Updating delivery status:', req.params.id, status);

  try {
    const delivery = await Delivery.findById(req.params.id);
    // if (!delivery || delivery.driver.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Unauthorized' });
    // }

    // Validate status transition
    if (!['in_transit', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (delivery.status === 'delivered') {
      return res.status(400).json({ message: 'Delivery already completed' });
    }

    if (status === 'delivered' && delivery.status !== 'in_transit') {
      return res.status(400).json({
        message: 'Delivery must be in_transit before marking as delivered',
      });
    }

    // Update delivery
    delivery.status = status;
    delivery.location =
      status === 'in_transit' ? 'On the way' : 'Customer Address';
    await delivery.save();

    // Step 1: Update order service if delivered
    if (status === 'delivered') {
      try {
        await axios.patch(
          `http://localhost:3003/api/orders/${delivery.order}/deliver`,
          {},
          {
            headers: { Authorization: req.header('Authorization') },
          }
        );
      } catch (orderUpdateError) {
        console.error(
          'Failed to update order service:',
          orderUpdateError.message
        );
        // Don't return here - proceed to notify and respond
      }

      // Step 2: Notify customer
      try {
        const orderResponse = await axios.get(
          `http://localhost:3003/api/orders/${delivery.order}`
        );

        const customerResponse = await axios.get(
          `http://localhost:3001/api/users/${orderResponse.data.customer}`
        );

        await axios.post(
          'http://localhost:3000/api/notifications/send',
          {
            orderId: delivery.order,
            customerEmail:
              customerResponse.data.email || 'customer@example.com',
            customerPhone: customerResponse.data.phone || '+94771234567',
            message: `Your order ${delivery.order} has been delivered!`,
          },
          {
            headers: { Authorization: `Bearer ${req.header('Authorization')}` },
          }
        );
      } catch (notifyErr) {
        console.error('Customer notification failed:', notifyErr.message);
        // Do NOT respond with error — delivery is still valid
      }
    }

    io.emit('deliveryUpdate', delivery);
    return res.json(delivery);
  } catch (err) {
    console.error('Update delivery status error:', err.message);
    return res
      .status(500)
      .json({ message: 'Something went wrong. Please try again.' });
  }
};

export const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ driver: req.user.id });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getDeliveryByOrderId = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ order: req.params.id });
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};