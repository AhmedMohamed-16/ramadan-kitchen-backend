import { Request, Response, NextFunction } from 'express';
import * as reportsService from './reports.service';
import { runDailyReportJob as runDailyReportJobForDate } from '../../scheduler/dailyReport.job';
import { successResponse } from '../../shared/utils/apiResponse';

export const getDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const report = await reportsService.getDailyReport(date);
    return successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

export const getPeriodReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate query parameters are required');
    }
    
    const report = await reportsService.getPeriodReport(
      startDate as string,
      endDate as string
    );
    return successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

// NEW: Manual trigger for daily report generation
export const runDailyReportJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const result = await runDailyReportJobForDate();
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};