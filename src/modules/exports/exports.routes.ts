import { Router } from 'express';
import * as exportsController from './exports.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Donations export - admin and accountant
router.get(
  '/donations',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  exportsController.exportDonations
);

// Expenses export - admin and accountant
router.get(
  '/expenses',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  exportsController.exportExpenses
);

// Distribution export - all roles
router.get(
  '/distribution/:date',
  authorizeRoles('ADMIN', 'ACCOUNTANT', 'DISTRIBUTOR'),
  exportsController.exportDistribution
);

// Daily report export - admin and accountant
router.get(
  '/reports/daily/:date',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  exportsController.exportDailyReport
);

// Period report export - admin and accountant
router.get(
  '/reports/period',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  exportsController.exportPeriodReport
);

export default router;