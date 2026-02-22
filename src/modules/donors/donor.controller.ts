import { Request, Response, NextFunction } from 'express';
import * as donorService from './donor.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const createDonor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const donor = await donorService.createDonor(req.body);
    return successResponse(res, donor, 201);
  } catch (error) {
    next(error);
  }
};

export const getDonors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, locationId } = req.query;
    const result = await donorService.getDonors({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      locationId: locationId as string,
    });
    return successResponse(res, result.data, 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getDonorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const donor = await donorService.getDonorById(req.params.id);
    return successResponse(res, donor);
  } catch (error) {
    next(error);
  }
};

export const updateDonor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const donor = await donorService.updateDonor(req.params.id, req.body);
    return successResponse(res, donor);
  } catch (error) {
    next(error);
  }
};

export const deleteDonor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await donorService.deleteDonor(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};