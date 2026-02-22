import { Request, Response, NextFunction } from 'express';
import * as locationService from './location.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await locationService.createLocation(req.body);
    return successResponse(res, location, 201);
  } catch (error) {
    next(error);
  }
};

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locations = await locationService.getLocations();
    return successResponse(res, locations);
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await locationService.getLocationById(req.params.id);
    return successResponse(res, location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await locationService.updateLocation(req.params.id, req.body);
    return successResponse(res, location);
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await locationService.deleteLocation(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};