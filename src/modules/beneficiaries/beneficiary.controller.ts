// import { Request, Response, NextFunction } from 'express';
// import * as beneficiaryService from './beneficiary.service';
// import { successResponse } from '../../shared/utils/apiResponse';

// export const createBeneficiary = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const beneficiary = await beneficiaryService.createBeneficiary(req.body);
//     return successResponse(res, beneficiary, 201);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getBeneficiaries = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { page, limit, search, locationId, needLevel, isActive, sortBy } = req.query;
    
//     const result = await beneficiaryService.getBeneficiaries({
//       page: page ? parseInt(page as string) : undefined,
//       limit: limit ? parseInt(limit as string) : undefined,
//       search: search as string,
//       locationId: locationId as string,
//       needLevel: needLevel as any,
//       isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
//       sortBy: sortBy as any,
//     });
    
//     return successResponse(res, result.data, 200, result.meta);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getBeneficiaryById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const beneficiary = await beneficiaryService.getBeneficiaryById(req.params.id);
//     return successResponse(res, beneficiary);
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateBeneficiary = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const beneficiary = await beneficiaryService.updateBeneficiary(
//       req.params.id,
//       req.body
//     );
//     return successResponse(res, beneficiary);
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateBeneficiaryStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const beneficiary = await beneficiaryService.updateBeneficiaryStatus(
//       req.params.id,
//       req.body.isActive
//     );
//     return successResponse(res, beneficiary);
//   } catch (error) {
//     next(error);
//   }
// };

// src/modules/beneficiaries/beneficiary.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as beneficiaryService from './beneficiary.service';
import { successResponse } from '../../shared/utils/apiResponse';
import { MealType } from '@prisma/client';

export const createBeneficiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const beneficiary = await beneficiaryService.createBeneficiary(req.body);
    return successResponse(res, beneficiary, 201);
  } catch (error) {
    next(error);
  }
};

export const getBeneficiaries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, locationId, mealType, isActive, sortBy } = req.query;

    const result = await beneficiaryService.getBeneficiaries({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      locationId: locationId as string,
      mealType: mealType as MealType | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: sortBy as 'name' | undefined,
    });

    return successResponse(res, result.data, 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getBeneficiaryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const beneficiary = await beneficiaryService.getBeneficiaryById(req.params.id);
    return successResponse(res, beneficiary);
  } catch (error) {
    next(error);
  }
};

export const updateBeneficiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const beneficiary = await beneficiaryService.updateBeneficiary(
      req.params.id,
      req.body
    );
    return successResponse(res, beneficiary);
  } catch (error) {
    next(error);
  }
};

export const updateBeneficiaryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const beneficiary = await beneficiaryService.updateBeneficiaryStatus(
      req.params.id,
      req.body.isActive
    );
    return successResponse(res, beneficiary);
  } catch (error) {
    next(error);
  }
};