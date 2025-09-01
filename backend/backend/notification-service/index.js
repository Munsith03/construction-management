import express from "express";
import dotenv from "dotenv";
import notificationRoutes from './routes/notificationRoutes.js';
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/notifications', notificationRoutes);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Notification Service Running");
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () =>
  console.log(`Notification Service running on port ${PORT}`),
);

