import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './auth.js';
import leadsRoutes from './leads.js';
import dashboardRoutes from './dashboard.js';
import customersRoutes from './customers.js';
import quotationsRoutes from './quotations.js';
import jobsRoutes from './jobs.js';
import invoicesRoutes from './invoices.js';
import { initDb } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/invoices', invoicesRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TranquilityOS API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
