// import { prisma } from '../../shared/database/prisma';
// import { AppError } from '../../shared/middleware/error.middleware';
// import { getPagination, getPaginationMeta } from '../../shared/utils/pagination.util';
// import { NeedLevel } from '@prisma/client';

// interface CreateBeneficiaryInput {
//   fullName: string;
//   phone: string;
//   numberOfChildren?: number;
//   needLevel?: NeedLevel;
//   maxMealsPerDay?: number;
//   locationId: string;
// }

// interface UpdateBeneficiaryInput {
//   fullName?: string;
//   phone?: string;
//   numberOfChildren?: number;
//   needLevel?: NeedLevel;
//   maxMealsPerDay?: number;
//   locationId?: string;
// }

// interface GetBeneficiariesParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   locationId?: string;
//   needLevel?: NeedLevel;
//   isActive?: boolean;
//   sortBy?: 'needLevel' | 'name';
// }

// export const createBeneficiary = async (input: CreateBeneficiaryInput) => {
//   // Verify location exists
//   const location = await prisma.location.findUnique({
//     where: { id: input.locationId },
//   });

//   if (!location) {
//     throw new AppError('Location not found', 404);
//   }

//   return await prisma.beneficiary.create({
//     data: input,
//     include: {
//       location: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//     },
//   });
// };

// export const getBeneficiaries = async (params: GetBeneficiariesParams) => {
//   const { skip, take, page, limit } = getPagination(params);

//   // Build where clause
//   const where: any = {};

//   if (params.search) {
//     where.OR = [
//       { fullName: { contains: params.search, mode: 'insensitive' } },
//       { phone: { contains: params.search, mode: 'insensitive' } },
//     ];
//   }

//   if (params.locationId) {
//     where.locationId = params.locationId;
//   }

//   if (params.needLevel) {
//     where.needLevel = params.needLevel;
//   }

//   if (params.isActive !== undefined) {
//     where.isActive = params.isActive;
//   }

//   // Build orderBy
//   let orderBy: any = { createdAt: 'desc' };

//   if (params.sortBy === 'needLevel') {
//     // Custom order: URGENT > HIGH > MEDIUM > LOW
//     orderBy = [
//       {
//         needLevel: 'desc' as const,
//       },
//       {
//         fullName: 'asc' as const,
//       },
//     ];
//   } else if (params.sortBy === 'name') {
//     orderBy = { fullName: 'asc' };
//   }

//   // Get total count
//   const total = await prisma.beneficiary.count({ where });

//   // Get beneficiaries
//   const beneficiaries = await prisma.beneficiary.findMany({
//     where,
//     skip,
//     take,
//     include: {
//       location: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//       eligibilityDays: {
//         select: {
//           dayOfWeek: true,
//         },
//         orderBy: {
//           dayOfWeek: 'asc',
//         },
//       },
//     },
//     orderBy,
//   });

//   // Transform eligibilityDays to simple array
//   const transformedBeneficiaries = beneficiaries.map((b) => ({
//     ...b,
//     eligibilityDays: b.eligibilityDays.map((d) => d.dayOfWeek),
//   }));

//   return {
//     data: transformedBeneficiaries,
//     meta: getPaginationMeta(total, page, limit),
//   };
// };

// export const getBeneficiaryById = async (id: string) => {
//   const beneficiary = await prisma.beneficiary.findUnique({
//     where: { id },
//     include: {
//       location: true,
//       eligibilityDays: {
//         select: {
//           dayOfWeek: true,
//         },
//         orderBy: {
//           dayOfWeek: 'asc',
//         },
//       },
//     },
//   });

//   if (!beneficiary) {
//     throw new AppError('Beneficiary not found', 404);
//   }

//   return {
//     ...beneficiary,
//     eligibilityDays: beneficiary.eligibilityDays.map((d) => d.dayOfWeek),
//   };
// };

// export const updateBeneficiary = async (id: string, input: UpdateBeneficiaryInput) => {
//   // Check if beneficiary exists
//   const existing = await prisma.beneficiary.findUnique({
//     where: { id },
//   });

//   if (!existing) {
//     throw new AppError('Beneficiary not found', 404);
//   }

//   // If updating location, verify it exists
//   if (input.locationId) {
//     const location = await prisma.location.findUnique({
//       where: { id: input.locationId },
//     });

//     if (!location) {
//       throw new AppError('Location not found', 404);
//     }
//   }

//   return await prisma.beneficiary.update({
//     where: { id },
//     data: input,
//     include: {
//       location: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//       eligibilityDays: {
//         select: {
//           dayOfWeek: true,
//         },
//         orderBy: {
//           dayOfWeek: 'asc',
//         },
//       },
//     },
//   });
// };

// export const updateBeneficiaryStatus = async (id: string, isActive: boolean) => {
//   // Check if beneficiary exists
//   const existing = await prisma.beneficiary.findUnique({
//     where: { id },
//   });

//   if (!existing) {
//     throw new AppError('Beneficiary not found', 404);
//   }

//   return await prisma.beneficiary.update({
//     where: { id },
//     data: { isActive },
//     include: {
//       location: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//     },
//   });
// };

// src/modules/beneficiaries/beneficiary.service.ts

import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination.util';
import { MealType } from '@prisma/client';

interface CreateBeneficiaryInput {
  fullName: string;
  nickName?: string;
  phone: string;
  numberOfChildren?: number;
  mealType?: MealType;
  maxMealsPerDay?: number;
  locationId: string;
}

interface UpdateBeneficiaryInput {
  fullName?: string;
  nickName?: string | null;
  phone?: string;
  numberOfChildren?: number;
  mealType?: MealType;
  maxMealsPerDay?: number;
  locationId?: string;
}

interface GetBeneficiariesParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  mealType?: MealType;
  isActive?: boolean;
  sortBy?: 'name';
}

export const createBeneficiary = async (input: CreateBeneficiaryInput) => {
  const location = await prisma.location.findUnique({ where: { id: input.locationId } });

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  return await prisma.beneficiary.create({
    data: {
      fullName: input.fullName,
      nickName: input.nickName,
      phone: input.phone,
      numberOfChildren: input.numberOfChildren ?? 0,
      mealType: input.mealType ?? MealType.KITCHEN,
      maxMealsPerDay: input.maxMealsPerDay ?? 1,
      locationId: input.locationId,
    },
    include: {
      location: { select: { id: true, name: true } },
    },
  });
};

export const getBeneficiaries = async (params: GetBeneficiariesParams) => {
  const { skip, take, page, limit } = getPagination(params);

  const where: any = {};

  if (params.search) {
    where.OR = [
      { fullName: { contains: params.search, mode: 'insensitive' } },
      { nickName: { contains: params.search, mode: 'insensitive' } },
      { phone: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params.locationId) where.locationId = params.locationId;
  if (params.mealType) where.mealType = params.mealType;
  if (params.isActive !== undefined) where.isActive = params.isActive;

  const orderBy: any =
    params.sortBy === 'name' ? { fullName: 'asc' } : { createdAt: 'desc' };

  const total = await prisma.beneficiary.count({ where });

  const beneficiaries = await prisma.beneficiary.findMany({
    where,
    skip,
    take,
    include: {
      location: { select: { id: true, name: true } },
      eligibilityDays: {
        select: { dayOfWeek: true },
        orderBy: { dayOfWeek: 'asc' },
      },
    },
    orderBy,
  });

  const transformedBeneficiaries = beneficiaries.map((b) => ({
    ...b,
    eligibilityDays: b.eligibilityDays.map((d) => d.dayOfWeek),
  }));

  return {
    data: transformedBeneficiaries,
    meta: getPaginationMeta(total, page, limit),
  };
};

export const getBeneficiaryById = async (id: string) => {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id },
    include: {
      location: true,
      eligibilityDays: {
        select: { dayOfWeek: true },
        orderBy: { dayOfWeek: 'asc' },
      },
    },
  });

  if (!beneficiary) {
    throw new AppError('Beneficiary not found', 404);
  }

  return {
    ...beneficiary,
    eligibilityDays: beneficiary.eligibilityDays.map((d) => d.dayOfWeek),
  };
};

export const updateBeneficiary = async (id: string, input: UpdateBeneficiaryInput) => {
  const existing = await prisma.beneficiary.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError('Beneficiary not found', 404);
  }

  // If switching from KITCHEN to HOME: auto-clear the schedule
  // to prevent orphaned eligibilityDays that would never be used
  if (input.mealType === MealType.HOME && existing.mealType === MealType.KITCHEN) {
    const scheduleCount = await prisma.beneficiaryEligibilityDay.count({
      where: { beneficiaryId: id },
    });

    if (scheduleCount > 0) {
      await prisma.beneficiaryEligibilityDay.deleteMany({ where: { beneficiaryId: id } });
    }
  }

  if (input.locationId) {
    const location = await prisma.location.findUnique({ where: { id: input.locationId } });
    if (!location) throw new AppError('Location not found', 404);
  }

  return await prisma.beneficiary.update({
    where: { id },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.nickName !== undefined && { nickName: input.nickName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.numberOfChildren !== undefined && { numberOfChildren: input.numberOfChildren }),
      ...(input.mealType !== undefined && { mealType: input.mealType }),
      ...(input.maxMealsPerDay !== undefined && { maxMealsPerDay: input.maxMealsPerDay }),
      ...(input.locationId !== undefined && { locationId: input.locationId }),
    },
    include: {
      location: { select: { id: true, name: true } },
      eligibilityDays: {
        select: { dayOfWeek: true },
        orderBy: { dayOfWeek: 'asc' },
      },
    },
  });
};

export const updateBeneficiaryStatus = async (id: string, isActive: boolean) => {
  const existing = await prisma.beneficiary.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError('Beneficiary not found', 404);
  }

  return await prisma.beneficiary.update({
    where: { id },
    data: { isActive },
    include: {
      location: { select: { id: true, name: true } },
    },
  });
};