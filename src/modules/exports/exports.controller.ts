import { Request, Response, NextFunction } from 'express';
import * as exportsService from './exports.service';
import { sendExcelFile } from '../../shared/utils/excel.util';

export const exportDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const workbook = await exportsService.exportDonations(
      startDate as string,
      endDate as string
    );

    const filename = `donations-${new Date().toISOString().split('T')[0]}.xlsx`;
    await sendExcelFile(res, workbook, filename);
  } catch (error) {
    next(error);
  }
};

export const exportExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const workbook = await exportsService.exportExpenses(
      startDate as string,
      endDate as string
    );

    const filename = `expenses-${new Date().toISOString().split('T')[0]}.xlsx`;
    await sendExcelFile(res, workbook, filename);
  } catch (error) {
    next(error);
  }
};

export const exportDistribution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const workbook = await exportsService.exportDistribution(date);

    const filename = `distribution-${date}.xlsx`;
    await sendExcelFile(res, workbook, filename);
  } catch (error) {
    next(error);
  }
};

export const exportDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const workbook = await exportsService.exportDailyReport(date);

    const filename = `daily-report-${date}.xlsx`;
    await sendExcelFile(res, workbook, filename);
  } catch (error) {
    next(error);
  }
};

export const exportPeriodReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate query parameters are required');
    }
    
    const workbook = await exportsService.exportPeriodReport(
      startDate as string,
      endDate as string
    );

    const filename = `period-report-${startDate}_to_${endDate}.xlsx`;
    await sendExcelFile(res, workbook, filename);
  } catch (error) {
    next(error);
  }
};