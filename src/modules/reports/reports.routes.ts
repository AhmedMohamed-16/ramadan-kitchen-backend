import { Router } from 'express';
import * as reportsController from './reports.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Daily report - admin, accountant, and distributor
router.get(
  '/daily/:date',
  authorizeRoles('ADMIN', 'ACCOUNTANT', 'DISTRIBUTOR'),
  reportsController.getDailyReport
);

// Period report - admin and accountant only
router.get(
  '/period',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  reportsController.getPeriodReport
);

// Manual trigger for daily report job - admin only
router.post(
  '/daily/:date/run',
  authorizeRoles('ADMIN'),
  reportsController.runDailyReportJob
);

export default router;