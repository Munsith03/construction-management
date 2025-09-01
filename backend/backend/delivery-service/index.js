import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import deliveryRoutes from './routes/deliveryRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
const server = http.createServer(app);
export const io = new Server(server);

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

app.use('/api/delivery', deliveryRoutes);

app.get('/', (req, res) => {
  res.send('Delivery Service Running');
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
