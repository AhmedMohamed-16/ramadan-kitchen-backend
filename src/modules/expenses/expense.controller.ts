import { Request, Response, NextFunction } from 'express';
import * as expenseService from './expense.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    return successResponse(res, expense, 201);
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, category, startDate, endDate } = req.query;
    
    const result = await expenseService.getExpenses({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      category: category as any,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    
    return successResponse(res, result.data, 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    return successResponse(res, expense);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    return successResponse(res, expense);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await expenseService.deleteExpense(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};