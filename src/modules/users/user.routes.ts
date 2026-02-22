import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from './user.validation';

const router = Router();

// All user routes require authentication and admin role
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;