import { Request, Response, NextFunction } from 'express';
import * as extraService from './extra.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const createExtraDistribution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const extraDistribution = await extraService.createExtraDistribution(
      date,
      req.body
    );
    return successResponse(res, extraDistribution, 201);
  } catch (error) {
    next(error);
  }
};

export const createExtraWithNewBeneficiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const result = await extraService.createExtraWithNewBeneficiary(
      date,
      req.body
    );
    return successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const getExtraDistributions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const result = await extraService.getExtraDistributions(date);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};