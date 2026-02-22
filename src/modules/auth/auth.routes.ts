import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { loginSchema } from './auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

export default router;