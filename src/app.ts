import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './shared/middleware/error.middleware';
import { notFoundHandler } from './shared/middleware/notFound.middleware';
// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import locationRoutes from './modules/locations/location.routes';
import donorRoutes from './modules/donors/donor.routes';
import donationRoutes from './modules/donations/donation.routes';
import beneficiaryRoutes from './modules/beneficiaries/beneficiary.routes';
import distributionRoutes from './modules/distribution/distribution.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import reportRoutes from './modules/reports/reports.routes';
import exportRoutes from './modules/exports/exports.routes';


const app: Application = express();

// Security & Parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (dev only)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes will be mounted here in future phases
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// ... etc
// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/exports', exportRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);


export default app;