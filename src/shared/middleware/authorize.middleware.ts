import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }

    next();
  };
};