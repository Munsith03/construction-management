// src/services/paymentService.js
import axios from "axios";

const BASE_URL = "http://localhost:3005/api/payments";

export const processPayment = async ({ orderId, amount }) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/process`,
      { orderId, amount },
      {
        headers: {
          // Skip token for now if not using auth
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("Payment process failed:", err.response?.data || err.message);
    throw err;
  }
};
