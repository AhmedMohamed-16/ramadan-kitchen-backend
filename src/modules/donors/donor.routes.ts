import { Router } from 'express';
import * as donorController from './donor.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createDonorSchema, updateDonorSchema } from './donor.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read operations - all authenticated users
router.get('/', donorController.getDonors);
router.get('/:id', donorController.getDonorById);

// Create/Update - admin and accountant
router.post(
  '/',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(createDonorSchema),
  donorController.createDonor
);

router.patch(
  '/:id',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(updateDonorSchema),
  donorController.updateDonor
);

// Delete - admin only
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  donorController.deleteDonor
);

export default router;