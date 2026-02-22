// import { Request, Response, NextFunction } from 'express';
// import * as distributionService from './distribution.service';
// import { successResponse } from '../../shared/utils/apiResponse';
// import { log } from 'console';

// export const initDistribution = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { date } = req.params;
//     const distributionDay = await distributionService.initDistribution({
//       date,
//       notes: req.body.notes,
//     });
//     return successResponse(res, distributionDay, 201);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getDistribution = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { date } = req.params;
//     const { sort, locationId, search } = req.query;

//     const result = await distributionService.getDistribution({
//       date,
//       sort: sort as any,
//       locationId: locationId as string,
//       search: search as string,
//     });
//     log("result",result)
//     return successResponse(res, result);
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateAllocation = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.params;
//     const allocation = await distributionService.updateAllocation(id, req.body);
//     return successResponse(res, allocation);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getDistributionSummary = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { date } = req.params;
//     const summary = await distributionService.getDistributionSummary(date);
//     return successResponse(res, summary);
//   } catch (error) {
//     next(error);
//   }
// };
// src/modules/distribution/distribution.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as distributionService from './distribution.service';
import { successResponse } from '../../shared/utils/apiResponse';

export const initDistribution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const distributionDay = await distributionService.initDistribution({
      date,
      notes: req.body.notes,
    });
    return successResponse(res, distributionDay, 201);
  } catch (error) {
    next(error);
  }
};

export const getDistribution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const { sort, locationId, search } = req.query;

    const result = await distributionService.getDistribution({
      date,
      sort: sort as 'name' | undefined,
      locationId: locationId as string,
      search: search as string,
    });

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateAllocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const allocation = await distributionService.updateAllocation(id, req.body);
    return successResponse(res, allocation);
  } catch (error) {
    next(error);
  }
};

export const getDistributionSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const summary = await distributionService.getDistributionSummary(date);
    return successResponse(res, summary);
  } catch (error) {
    next(error);
  }
};

// ─── Home Deliveries ─────────────────────────

export const recordHomeDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const result = await distributionService.recordHomeDelivery(date, req.body);
    return successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const getHomeDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const locationId = req.query.locationId as string | undefined;
    const result = await distributionService.getHomeDeliveries(date, locationId);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};