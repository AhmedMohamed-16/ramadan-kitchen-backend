import { Router } from 'express';
import * as beneficiaryController from './beneficiary.controller';
import * as scheduleController from '../beneficiarySchedule/schedule.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
  updateStatusSchema,
} from './beneficiary.validation';
import { updateScheduleSchema } from '../beneficiarySchedule/schedule.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read operations - all authenticated users
router.get('/', beneficiaryController.getBeneficiaries);
router.get('/:id', beneficiaryController.getBeneficiaryById);

// Create - admin and distributor
router.post(
  '/',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(createBeneficiarySchema),
  beneficiaryController.createBeneficiary
);

// Update - admin and distributor
router.patch(
  '/:id',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(updateBeneficiarySchema),
  beneficiaryController.updateBeneficiary
);

// Update status - admin and distributor
router.patch(
  '/:id/status',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(updateStatusSchema),
  beneficiaryController.updateBeneficiaryStatus
);

// Schedule management - admin and distributor
router.get('/:id/schedule', scheduleController.getSchedule);
router.put(
  '/:id/schedule',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(updateScheduleSchema),
  scheduleController.updateSchedule
);

export default router;