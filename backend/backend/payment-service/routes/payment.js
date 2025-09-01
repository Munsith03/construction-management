import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import Payment from "../models/payment.js";  

dotenv.config(); 

const router = express.Router();

const merchant_id = process.env.MERCHANT_ID;
const merchant_secret = process.env.MERCHANT_SECRET;

if (!merchant_id || !merchant_secret) {
  console.error("Missing MERCHANT_ID or MERCHANT_SECRET in .env");
}

router.post("/start", (req, res) => {
  const { order_id, amount, currency } = req.body;
  console.log("Payment request for order:", order_id);

  
  if (!order_id || !amount || !currency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Generate the hash value
    const hash = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          amount +
          currency +
          crypto
            .createHash("md5")
            .update(merchant_secret)
            .digest("hex")
            .toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    console.log("Hash generated for order:", order_id);

    res.json({ hash, merchant_id });
  } catch (error) {
    console.error("Error generating hash:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Payment notification endpoint
router.post("/notify", async (req, res) => {
  console.log("Payment notification received");

  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  
  try {
    const local_md5sig = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          crypto
            .createHash("md5")
            .update(merchant_secret)
            .digest("hex")
            .toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    console.log("Payment notification for order:", order_id);

    if (local_md5sig === md5sig && status_code == "2") {
      // Payment success - Save payment details to the database
      console.log("Payment successful for order:", order_id);

      // Save the payment record in the database
      const newPayment = new Payment({
        orderId: order_id,
        userId: null,
        amount: payhere_amount,
        status: 'success', // Successful payment
        method: 'card', // 'Cash' or 'Card'
        transactionId: order_id,
      });

      await newPayment.save();
      console.log("Payment details saved to the database");

      res.sendStatus(200); // Respond to PayHere
    } else {
      // Payment verification failed
      console.log("Payment verification failed for order:", order_id);
      res.sendStatus(400); // Bad request if verification fails
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
