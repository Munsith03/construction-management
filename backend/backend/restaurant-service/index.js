import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
// MongoDB Connection with retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: 'majority',
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/uploads', express.static('uploads'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Restaurant Service Running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong on the server',
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`Restaurant Service running on port ${PORT}`)
);
