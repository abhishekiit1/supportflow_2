import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { seedDatabase } from './utils/seed.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js'; 

import ticketRoutes from './routes/tickets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'SupportFlow API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });