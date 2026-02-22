import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination.util';
import { ExpenseCategory } from '@prisma/client';

interface CreateExpenseInput {
  name: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

interface UpdateExpenseInput {
  name?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: string;
}

interface GetExpensesParams {
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
}

export const createExpense = async (input: CreateExpenseInput) => {
  return await prisma.expense.create({
    data: {
      ...input,
      date: new Date(input.date),
    },
  });
};

export const getExpenses = async (params: GetExpensesParams) => {
  const { skip, take, page, limit } = getPagination(params);

  // Build where clause
  const where: any = {};

  if (params.category) {
    where.category = params.category;
  }

  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.date.lte = new Date(params.endDate);
    }
  }

  // Get total count
  const total = await prisma.expense.count({ where });

  // Get expenses
  const expenses = await prisma.expense.findMany({
    where,
    skip,
    take,
    orderBy: { date: 'desc' },
  });

  return {
    data: expenses,
    meta: getPaginationMeta(total, page, limit),
  };
};

export const getExpenseById = async (id: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  return expense;
};

export const updateExpense = async (id: string, input: UpdateExpenseInput) => {
  // Check if expense exists
  const existing = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Expense not found', 404);
  }

  // Prepare update data
  const updateData: any = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.date !== undefined) updateData.date = new Date(input.date);

  return await prisma.expense.update({
    where: { id },
    data: updateData,
  });
};

export const deleteExpense = async (id: string) => {
  // Check if expense exists
  const existing = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Expense not found', 404);
  }

  await prisma.expense.delete({
    where: { id },
  });

  return { message: 'Expense deleted successfully' };
};