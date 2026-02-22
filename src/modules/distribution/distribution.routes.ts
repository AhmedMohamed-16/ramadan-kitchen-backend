// import { Router } from 'express';
// import * as distributionController from './distribution.controller';
// import * as extraController from './extra.controller';
// import { authenticate } from '../../shared/middleware/authenticate.middleware';
// import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
// import { validate } from '../../shared/middleware/validate.middleware';
// import {
//   initDistributionSchema,
//   updateAllocationSchema,
// } from './distribution.validation';
// import { createExtraDistributionSchema, createExtraWithNewBeneficiarySchema } from './extra.validation';

// const router = Router();

// // All routes require authentication
// router.use(authenticate);

// // Initialize distribution day - admin and distributor
// router.post(
//   '/:date/init',
//   authorizeRoles('ADMIN', 'DISTRIBUTOR'),
//   validate(initDistributionSchema),
//   distributionController.initDistribution
// );

// // Get distribution for date - all authenticated users
// router.get('/:date', distributionController.getDistribution);

// // Get summary - all authenticated users
// router.get('/:date/summary', distributionController.getDistributionSummary);

// // Update allocation - admin and distributor
// router.patch(
//   '/allocation/:id',
//   authorizeRoles('ADMIN', 'DISTRIBUTOR'),
//   validate(updateAllocationSchema),
//   distributionController.updateAllocation
// );



// // Initialize distribution day - admin and distributor
// router.post(
//   '/:date/init',
//   authorizeRoles('ADMIN', 'DISTRIBUTOR'),
//   validate(initDistributionSchema),
//   distributionController.initDistribution
// );

// // Get distribution for date - all authenticated users
// router.get('/:date', distributionController.getDistribution);

// // Get summary - all authenticated users
// router.get('/:date/summary', distributionController.getDistributionSummary);

// // Update allocation - admin and distributor
// router.patch(
//   '/allocation/:id',
//   authorizeRoles('ADMIN', 'DISTRIBUTOR'),
//   validate(updateAllocationSchema),
//   distributionController.updateAllocation
// );

// // Extra distributions - get list (all authenticated users)
// router.get('/:date/extra', extraController.getExtraDistributions);

// // Extra distributions - create for existing beneficiary (admin and distributor)
// router.post(
//   '/:date/extra',
//   authorizeRoles('ADMIN', 'DISTRIBUTOR'),
//   validate(createExtraDistributionSchema),
//   extraController.createExtraDistribution
// );

// // Extra distributions - create with new beneficiary (admin and distributor)
// router.post(
//   '/:date/extra/new-beneficiary',
//   authorizeRoles('ADMIN', 'DISTRIBUTOR'),
//   validate(createExtraWithNewBeneficiarySchema),
//   extraController.createExtraWithNewBeneficiary
// );


// export default router;


// src/modules/distribution/distribution.routes.ts

import { Router } from 'express';
import * as distributionController from './distribution.controller';
import * as extraController from './extra.controller';
import * as scheduleController from '../beneficiarySchedule/schedule.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  initDistributionSchema,
  updateAllocationSchema,
  recordHomeDeliverySchema,
} from './distribution.validation';
import {
  createExtraDistributionSchema,
  createExtraWithNewBeneficiarySchema,
} from './extra.validation';
import { updateScheduleSchema } from '../beneficiarySchedule/schedule.validation';

const router = Router();

router.use(authenticate);

// ─── Init & Get distribution (KITCHEN) ────────────────────────

// POST /api/distribution/:date/init
router.post(
  '/:date/init',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(initDistributionSchema),
  distributionController.initDistribution
);

// GET /api/distribution/:date
router.get('/:date', distributionController.getDistribution);

// GET /api/distribution/:date/summary
router.get('/:date/summary', distributionController.getDistributionSummary);

// ─── Allocations ─────────────────────────────────────────────

// PATCH /api/distribution/allocation/:id
router.patch(
  '/allocation/:id',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(updateAllocationSchema),
  distributionController.updateAllocation
);

// ─── Home Deliveries ─────────────────────────────────────────

// POST /api/distribution/:date/home
router.post(
  '/:date/home',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(recordHomeDeliverySchema),
  distributionController.recordHomeDelivery
);

// GET /api/distribution/:date/home?locationId=xxx
router.get('/:date/home', distributionController.getHomeDeliveries);

// ─── Extra Distributions ─────────────────────────────────────

// GET /api/distribution/:date/extra
router.get('/:date/extra', extraController.getExtraDistributions);

// POST /api/distribution/:date/extra
router.post(
  '/:date/extra',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(createExtraDistributionSchema),
  extraController.createExtraDistribution
);

// POST /api/distribution/:date/extra/new-beneficiary
router.post(
  '/:date/extra/new-beneficiary',
  authorizeRoles('ADMIN', 'DISTRIBUTOR'),
  validate(createExtraWithNewBeneficiarySchema),
  extraController.createExtraWithNewBeneficiary
);

export default router;