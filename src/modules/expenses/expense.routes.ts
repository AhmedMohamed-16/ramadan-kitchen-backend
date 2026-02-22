import { Router } from 'express';
import * as expenseController from './expense.controller';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { authorizeRoles } from '../../shared/middleware/authorize.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createExpenseSchema, updateExpenseSchema } from './expense.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read operations - all authenticated users
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpenseById);

// Create/Update - admin and accountant only
router.post(
  '/',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(createExpenseSchema),
  expenseController.createExpense
);

router.patch(
  '/:id',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

// Delete - admin only
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  expenseController.deleteExpense
);

export default router;