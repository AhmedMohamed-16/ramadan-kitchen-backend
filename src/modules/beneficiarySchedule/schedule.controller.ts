import { Request, Response, NextFunction } from 'express';
import * as scheduleService from './schedule.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const getSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedule = await scheduleService.getSchedule(req.params.id);
    return successResponse(res, schedule);
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedule = await scheduleService.updateSchedule(
      req.params.id,
      req.body.days
    );
    return successResponse(res, schedule);
  } catch (error) {
    next(error);
  }
};