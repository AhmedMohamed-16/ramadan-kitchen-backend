import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};