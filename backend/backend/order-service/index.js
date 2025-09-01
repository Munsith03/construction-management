import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server);
app.use(express.json());

app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Order Service Running');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
