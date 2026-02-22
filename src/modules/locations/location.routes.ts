import { Router } from 'express';
import * as locationController from './location.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createLocationSchema, updateLocationSchema } from './location.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read operations - all authenticated users
router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocationById);

// Write operations - admin only
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validate(createLocationSchema),
  locationController.createLocation
);

router.patch(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updateLocationSchema),
  locationController.updateLocation
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  locationController.deleteLocation
);

export default router;