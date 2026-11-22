import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/schema';

import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';
import vitalsRoutes from './routes/vitals';
import dailyPlanRoutes from './routes/dailyPlan';
import medicationsRoutes from './routes/medications';
import reportsRoutes from './routes/reports';
import foodScannerRoutes from './routes/foodScanner';
import doctorRoutes from './routes/doctor';
import caregiverRoutes from './routes/caregiver';
import aiRoutes from './routes/ai';
import alertsRoutes from './routes/alerts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize DB schema & seed demo data
initDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/daily-plan', dailyPlanRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/food-scanner', foodScannerRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alerts', alertsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'VitalCare API Server', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`VitalCare Backend API Server running on port ${PORT}`);
});
