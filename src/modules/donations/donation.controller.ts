import { Request, Response, NextFunction } from 'express';
import * as donationService from './donation.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const createDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const donation = await donationService.createDonation(req.body);
    return successResponse(res, donation, 201);
  } catch (error) {
    next(error);
  }
};

export const getDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, donorId, startDate, endDate } = req.query;
    const result = await donationService.getDonations({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      donorId: donorId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    return successResponse(res, result.data, 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getDonationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);
    return successResponse(res, donation);
  } catch (error) {
    next(error);
  }
};

export const deleteDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await donationService.deleteDonation(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};