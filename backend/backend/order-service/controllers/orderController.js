import Order from '../models/Order.js';
import { io } from '../index.js';
import axios from 'axios';
import Stripe from 'stripe';

import dotenv from 'dotenv';

dotenv.config();

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export const placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, address, paymentMethod, paymentIntent } =
      req.body;
    const userId = req.user._id; // From auth middleware

    // Validate request
    if (
      !restaurantId ||
      !items ||
      !items.length ||
      !address ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID, items, address, and payment method are required',
      });
    }

    // Validate restaurant via Restaurant Service
    const restaurantResponse = await axios.get(
      `${process.env.RESTAURANT_SERVICE_URL}/restaurants/${restaurantId}`
    );

    const restaurant = restaurantResponse.data.data;
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    // Validate menu items
    for (const item of items) {
      const menuItemResponse = await axios.get(
        `${process.env.RESTAURANT_SERVICE_URL}/menu/${item.menuItem}`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      const menuItem = menuItemResponse.data.data;
      if (!menuItem || menuItem.restaurant.toString() !== restaurantId) {
        return res.status(400).json({
          success: false,
          error: `Menu item ${item.menuItem} is invalid or does not belong to the restaurant`,
        });
      }

      if (item.price !== menuItem.price) {
        return res.status(400).json({
          success: false,
          error: `Price mismatch for menu item ${item.menuItem}`,
        });
      }
    }

    // Calculate total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      customer: userId,
      restaurant: restaurantId,
      items,
      address,
      paymentMethod,
      total,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    await order.save();

    // Clear user's cart via Cart Service API
    try {
      await axios.delete(`${process.env.USER_SERVICE_URL}/cart`, {
        headers: { Authorization: req.headers.authorization },
      });
    } catch (cartError) {
      console.error(
        'Error clearing cart:',
        cartError.response?.data || cartError.message
      );
      // Continue with order response even if cart clearing fails
    }

    if (paymentMethod === 'online' && paymentIntent) {
      // Create Stripe Payment Intent
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        metadata: { orderId: order._id.toString() },
      });

      return res.status(200).json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          order,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
};

// //Place Order
// export const placeOrder = async (req, res) => {
//   const { restaurantId, items } = req.body;
//   try {
//     const total = items.reduce(
//       (sum, item) => sum + item.quantity * item.price,
//       0
//     );
//     const order = new Order({
//       customer: req.user.id,
//       restaurant: restaurantId,
//       items,
//       total,
//     });
//     await order.save();

//     // const paymentResponse = await axios.post(
//     //   'http://localhost:3000/api/payments/process',
//     //   { orderId: order._id, amount: total },
//     //   { headers: { Authorization: `Bearer ${req.header('Authorization')}` } }
//     // );

//     io.emit('newOrder', order);
//     res.status(201).json(order);
//   } catch (error) {
//     console.error('eoorr', error);
//     res.status(500).json({ message: 'Error in Placing Order' });
//   }
// };

//Before Confirmation Update Order
export const updateOrder = async (req, res) => {
  const { items } = req.body;
  try {
    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const order = await Order.findById(req.params.id);
    if (
      !order ||
      order.customer.toString() !== req.user.id ||
      order.status !== 'pending'
    ) {
      return res.status(403).json({ message: 'Cannot modify order' });
    }
    order.items = items;
    order.total = total;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Cancel Order (Before Confirmation)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be canceled' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: 'Order canceled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get pending orders of that restrauant
export const getPending = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.id,
      status: 'pending',
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Change Order Status to Preparing (Restaurant Admin)
export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Order cannot be set to preparing' });
    }

    order.status = 'preparing';
    await order.save();

    // await axios.post('http://localhost:3000/api/notifications/send', {
    //   orderId: order._id,
    //   customerEmail: 'customer@example.com',
    //   customerPhone: '+94771234567',
    // });

    io.emit('orderStatusUpdate', order);
    res.json({ message: 'Order accepted and set to preparing', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get preparing orders of that restrauant
export const getPrepare = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.id,
      status: 'preparing',
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Change Order Status to Ready for Pickup (Restaurant Admin)
export const prepareOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'preparing') {
      return res
        .status(400)
        .json({ message: 'Order must be in preparing status' });
    }

    order.status = 'ready-to-pickup';
    await order.save();

    io.emit('orderStatusUpdate', order);
    res.json({ message: 'Order is ready for pickup', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get ready to pickup orders of that restrauant
export const getPickup = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.id,
      status: 'ready-to-pickup',
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Preparing Orders for Delivery Personnel
export const getReady = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'ready-to-pickup' });

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        // Fetch customer data from User service
        // const customerResponse = await axios.get(
        //   `http://localhost:3001/api/user/${order.customer}`
        // );
        // const customer = customerResponse.data;

        // // Fetch restaurant data from Restaurant service
        // const restaurantResponse = await axios.get(
        //   `http://restaurant-service:3002/api/restaurants/${order.restaurant}`
        // );
        // const restaurant = restaurantResponse.data;

        // // Fetch menu item data for each item
        // const items = await Promise.all(
        //   order.items.map(async (item) => {
        //     const menuItemResponse = await axios.get(
        //       `http://restaurant-service:3002/api/menu-items/${item.menuItem}`
        //     );
        //     return {
        //       menuItem: menuItemResponse.data,
        //       quantity: item.quantity,
        //       price: item.price,
        //     };
        //   })
        // );

        // Return enriched order
        return {
          ...order.toObject(),
          // customer,
          // restaurant,
          // items,
        };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Change Order Status to Picked
export const pickedOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'ready-to-pickup') {
      return res
        .status(400)
        .json({ message: 'Order must be in ready to pickup status' });
    }

    order.status = 'picked';
    await order.save();

    io.emit('orderStatusUpdate', order);
    res.json({ message: 'Order confirmed for delivery', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get picked orders of that restrauant
export const getPicked = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.id,
      status: 'picked',
    });

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        // Fetch customer data from User service
        // const customerResponse = await axios.get(
        //   `http://localhost:3001/api/user/${order.customer}`
        // );
        // const customer = customerResponse.data;

        // Fetch menu item data for each item
        // const items = await Promise.all(
        //   order.items.map(async (item) => {
        //     const menuItemResponse = await axios.get(
        //       `http://restaurant-service:3002/api/menu-items/${item.menuItem}`
        //     );
        //     return {
        //       menuItem: menuItemResponse.data,
        //       quantity: item.quantity,
        //       price: item.price,
        //     };
        //   })
        // );

        // Return enriched order
        return {
          ...order.toObject(),
          // customer,
          // items,
        };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Change Order Status to Delivered (Delivery Person)
export const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'picked') {
      return res
        .status(400)
        .json({ message: 'Order must be in picked status' });
    }

    order.status = 'delivered';
    await order.save();

    io.emit('orderStatusUpdate', order);
    res.json({ message: 'Order delivered successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get delivered orders of that restrauant
export const getDelivered = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.id,
      status: 'delivered',
    });

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        // Fetch customer data from User service
        // const customerResponse = await axios.get(
        //   `http://localhost:3001/api/user/${order.customer}`
        // );
        // const customer = customerResponse.data;

        // Fetch menu item data for each item
        // const items = await Promise.all(
        //   order.items.map(async (item) => {
        //     const menuItemResponse = await axios.get(
        //       `http://restaurant-service:3002/api/menu-items/${item.menuItem}`
        //     );
        //     return {
        //       menuItem: menuItemResponse.data,
        //       quantity: item.quantity,
        //       price: item.price,
        //     };
        //   })
        // );

        // Return enriched order
        return {
          ...order.toObject(),
          // customer,
          // items,
        };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Track One Specific Order (Customer)
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    // if (!order || order.customer.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Unauthorized' });
    // }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Customer Past Orders
export const getOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: 'User not authenticated', code: 'UNAUTHENTICATED' });
    }

    const orders = await Order.find({ customer: req.user.id });
    res.json(orders);
  } catch (err) {
    console.error(`[SERVER_ERROR] ${err.message}`);
    res
      .status(500)
      .json({ message: 'Failed to fetch orders', error: err.message });
  }
};

//Admin Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        // Fetch customer data from User service

        // // Fetch restaurant data from Restaurant service
        // const restaurantResponse = await axios.get(
        //   `http://restaurant-service:3002/api/restaurants/${order.restaurant}`
        // );
        // const restaurant = restaurantResponse.data;

        // // Fetch menu item data for each item
        // const items = await Promise.all(
        //   order.items.map(async (item) => {
        //     const menuItemResponse = await axios.get(
        //       `http://restaurant-service:3002/api/menu-items/${item.menuItem}`
        //     );
        //     return {
        //       menuItem: menuItemResponse.data,
        //       quantity: item.quantity,
        //       price: item.price,
        //     };
        //   })
        // );

        // Return enriched order
        return {
          ...order.toObject(),

          // restaurant,
          // items,
        };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
