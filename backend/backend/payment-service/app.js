import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";
import paymentHistoryRoutes from "./routes/paymentHistory.js";
import mongoose from "mongoose";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Set up routes
app.use("/payment", paymentRoutes);
app.use("/api", paymentHistoryRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Payment History Service Running");
});

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
