import { Router } from 'express';
import * as donationController from './donation.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createDonationSchema } from './donation.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read operations - all authenticated users
router.get('/', donationController.getDonations);
router.get('/:id', donationController.getDonationById);

// Create - admin and accountant
router.post(
  '/',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(createDonationSchema),
  donationController.createDonation
);

// Delete - admin only
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  donationController.deleteDonation
);

export default router;