// import { log } from 'console';
// import { prisma } from '../../shared/database/prisma';
// import { AppError } from '../../shared/middleware/error.middleware';
// import { getDayOfWeek, isValidDateFormat } from '../../shared/utils/dateHelpers';

// interface InitDistributionInput {
//   date: string;
//   notes?: string;
// }

// interface UpdateAllocationInput {
//   received?: boolean;
//   mealsDelivered?: number;
//   notes?: string;
// }

// interface GetDistributionParams {
//   date: string;
//   sort?: 'needLevel' | 'name';
//   locationId?: string;
//   search?: string;
// }

// // export const initDistribution = async (input: InitDistributionInput) => {
// //   const { date, notes } = input;
// // log("date",date)
// //   // Validate date format
// //   if (!isValidDateFormat(date)) {
// //     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
// //   }

// //   const dayDate = new Date(date);

// //   // Get day of week (0 = Sunday, 6 = Saturday)
// //   const dayOfWeek = getDayOfWeek(date);
// // log("dayOfWeek",dayOfWeek)

// //   // Find eligible beneficiaries for this day
// //   const eligibleBeneficiaries = await prisma.beneficiary.findMany({
// //     where: {
// //       isActive: true,
// //       eligibilityDays: {
// //         some: { dayOfWeek },
// //       },
// //     },
// //     include: {
// //       location: true,
// //     },
// //     orderBy: [
// //       { needLevel: 'desc' },
// //       { fullName: 'asc' },
// //     ],
// //   });
// //   log("eligibleBeneficiaries",eligibleBeneficiaries)

// //   const distributionDay = await prisma.$transaction(async (tx) => {
// //     // ─────────────────────────────────────────────
// //     // 1️⃣ Create or get existing distribution day
// //     // ─────────────────────────────────────────────
// //     let day = await tx.distributionDay.findUnique({
// //       where: { date: dayDate },
// //     });

// //     if (!day) {
// //       day = await tx.distributionDay.create({
// //         data: {
// //           date: dayDate,
// //           notes,
// //         },
// //       });
// //     }

// //     // ─────────────────────────────────────────────
// //     // 2️⃣ Get existing allocations
// //     // ─────────────────────────────────────────────
// //     const existingAllocations = await tx.distributionAllocation.findMany({
// //       where: { distributionDayId: day.id },
// //       select: { beneficiaryId: true },
// //     });

// //     const existingIds = new Set(
// //       existingAllocations.map((a) => a.beneficiaryId)
// //     );

// //     // ─────────────────────────────────────────────
// //     // 3️⃣ Add ONLY missing beneficiaries
// //     // ─────────────────────────────────────────────
// //     const newAllocations = eligibleBeneficiaries.filter(
// //       (b) => !existingIds.has(b.id)
// //     );

// //     if (newAllocations.length > 0) {
// //       await tx.distributionAllocation.createMany({
// //         data: newAllocations.map((beneficiary) => ({
// //           distributionDayId: day.id,
// //           beneficiaryId: beneficiary.id,
// //           received: false,
// //           mealsDelivered: 0, 
// //         })),
// //       });
// //     }

// //     // ─────────────────────────────────────────────
// //     // 4️⃣ Return full distribution
// //     // ─────────────────────────────────────────────
// //     return await tx.distributionDay.findUnique({
// //       where: { id: day.id },
// //       include: {
// //         allocations: {
// //           include: {
// //             beneficiary: {
// //               include: {
// //                 location: true,
// //               },
// //             },
// //           },
// //           orderBy: [
// //             { beneficiary: { needLevel: 'desc' } },
// //             { beneficiary: { fullName: 'asc' } },
// //           ],
// //         },
// //       },
// //     });
// //   });

// //   return distributionDay;
// // };

// export const initDistribution = async (input: InitDistributionInput) => {
//   const { date, notes } = input;

//   if (!isValidDateFormat(date)) {
//     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
//   }

//   const dayDate = new Date(date);
//   const dayOfWeek = getDayOfWeek(date);

//   const eligibleBeneficiaries = await prisma.beneficiary.findMany({
//     where: {
//       isActive: true,
//       eligibilityDays: { some: { dayOfWeek } },
//     },
//     include: { location: true },
//     orderBy: [{ needLevel: 'desc' }, { fullName: 'asc' }],
//   });

//   const distributionDay = await prisma.$transaction(async (tx) => {
//     let day = await tx.distributionDay.findUnique({ where: { date: dayDate } });

//     if (!day) {
//       day = await tx.distributionDay.create({ data: { date: dayDate, notes } });
//     }

//     const existingAllocations = await tx.distributionAllocation.findMany({
//       where: { distributionDayId: day.id },
//       select: { beneficiaryId: true },
//     });

//     const existingIds = new Set(existingAllocations.map((a) => a.beneficiaryId));

//     const newAllocations = eligibleBeneficiaries.filter((b) => !existingIds.has(b.id));

//     if (newAllocations.length > 0) {
//       await tx.distributionAllocation.createMany({
//         data: newAllocations.map((b) => ({
//           distributionDayId: day.id,
//           beneficiaryId: b.id,
//           received: false,
//           mealsDelivered: 0,
//         })),
//       });
//     }

//     const result = await tx.distributionDay.findUnique({
//       where: { id: day.id },
//       include: {
//         allocations: {
//           include: {
//             beneficiary: { include: { location: true } },
//           },
//           orderBy: [
//             { beneficiary: { needLevel: 'desc' } },
//             { beneficiary: { fullName: 'asc' } },
//           ],
//         },
//       },
//     });

//     return {
//       ...result,
//       allocations: result!.allocations.map((a) => ({
//         ...a,
//         plannedMeals: a.beneficiary.maxMealsPerDay,
//       })),
//     };
//   });

//   return distributionDay;
// };

// export const getDistribution = async (params: GetDistributionParams) => {
//   const { date, sort, locationId, search } = params;

//   // Validate date format
//   if (!isValidDateFormat(date)) {
//     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
//   }

//   // Get distribution day
//   const distributionDay = await prisma.distributionDay.findUnique({
//     where: { date: new Date(date) },
//   });

//   if (!distributionDay) {
//     throw new AppError('Distribution day not found. Initialize it first.', 404);
//   }

//   // Build where clause for allocations
//   const where: any = {
//     distributionDayId: distributionDay.id,
//   };

//   if (locationId) {
//     where.beneficiary = {
//       locationId,
//     };
//   }

//   if (search) {
//     where.beneficiary = {
//       ...where.beneficiary,
//       OR: [
//         { fullName: { contains: search, mode: 'insensitive' } },
//         { phone: { contains: search, mode: 'insensitive' } },
//       ],
//     };
//   }

//   // Build orderBy
//   let orderBy: any = [
//     { beneficiary: { needLevel: 'desc' } },
//     { beneficiary: { fullName: 'asc' } },
//   ];

//   if (sort === 'name') {
//     orderBy = [{ beneficiary: { fullName: 'asc' } }];
//   }

// // Get allocations
// const rawAllocations = await prisma.distributionAllocation.findMany({
//   where,
//   include: {
//     beneficiary: {
//       include: {
//         location: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     },
//   },
//   orderBy,
// });

// // Build frontend-ready allocations
// const allocations = rawAllocations.map((a) => ({
//   ...a,

//   // planned meals comes from beneficiary config
//   plannedMeals: a.beneficiary.maxMealsPerDay,

//   // normalized status for frontend
//   status:
//     a.received === true
//       ? 'DELIVERED'
//       : a.mealsDelivered > 0
//       ? 'PARTIAL'
//       : 'PENDING',
// }));

// return {
//   distributionDay,
//   allocations,
// };

// };

// export const updateAllocation = async (
//   allocationId: string,
//   input: UpdateAllocationInput
// ) => {
//   // Check if allocation exists
//   const existing = await prisma.distributionAllocation.findUnique({
//     where: { id: allocationId },
//   });

//   if (!existing) {
//     throw new AppError('Allocation not found', 404);
//   }

//   // Update allocation
//   const updated = await prisma.distributionAllocation.update({
//     where: { id: allocationId },
//     data: input,
//     include: {
//       beneficiary: {
//         include: {
//           location: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   return updated;
// };

// export const getDistributionSummary = async (date: string) => {
//   // Validate date format
//   if (!isValidDateFormat(date)) {
//     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
//   }

//   // Get distribution day
//   const distributionDay = await prisma.distributionDay.findUnique({
//     where: { date: new Date(date) },
//   });

//   if (!distributionDay) {
//     throw new AppError('Distribution day not found. Initialize it first.', 404);
//   }

//   // Get all allocations for the day
//   const allocations = await prisma.distributionAllocation.findMany({
//     where: {
//       distributionDayId: distributionDay.id,
//     },
//     include: {
//       beneficiary: {
//         select: {
//           maxMealsPerDay: true,
//         },
//       },
//     },
//   });

//   // Calculate planned meals (sum of maxMealsPerDay for all allocations)
//   const plannedMeals = allocations.reduce(
//     (sum, allocation) => sum + allocation.beneficiary.maxMealsPerDay,
//     0
//   );

//   // Calculate delivered meals
//   const deliveredMeals = allocations.reduce(
//     (sum, allocation) => sum + allocation.mealsDelivered,
//     0
//   );

//   // Count statuses
//   const deliveredCount = allocations.filter((a) => a.received === true).length;
//   const absentCount = allocations.filter(
//     (a) => a.received === false && a.mealsDelivered === 0
//   ).length;
  
//   // Get extra distributions for this date
//   const extraDistributions = await prisma.extraDistribution.findMany({
//     where: {
//       date: new Date(date),
//     },
//   });

//   const extraMealsCount = extraDistributions.reduce(
//     (sum, extra) => sum + extra.mealsGiven,
//     0
//   );

//   return {
//     date,
//     plannedMeals,
//     deliveredMeals,
//     deliveredCount,
//     absentCount, 
//     totalAllocations: allocations.length,
//     extraMealsCount,
//     extraDistributionsCount: extraDistributions.length,
//   };
// };

// src/modules/distribution/distribution.service.ts

import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { getDayOfWeek, isValidDateFormat } from '../../shared/utils/dateHelpers';
import { MealType } from '@prisma/client';

interface InitDistributionInput {
  date: string;
  notes?: string;
}

interface UpdateAllocationInput {
  received?: boolean;
  mealsDelivered?: number;
  notes?: string;
}

interface GetDistributionParams {
  date: string;
  sort?: 'name';
  locationId?: string;
  search?: string;
}

interface RecordHomeDeliveryInput {
  beneficiaryId: string;
  mealsDelivered: number;
  notes?: string;
}

// ─────────────────────────────────────────────
// INIT DISTRIBUTION
// ─────────────────────────────────────────────

/**
 * Creates a DistributionDay and auto-allocates KITCHEN beneficiaries only.
 * HOME beneficiaries are excluded — they are recorded on-demand via recordHomeDelivery.
 */
export const initDistribution = async (input: InitDistributionInput) => {
  const { date, notes } = input;

  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const dayDate = new Date(date);
  const dayOfWeek = getDayOfWeek(date);

  // KITCHEN only — HOME beneficiaries intentionally excluded
  const eligibleBeneficiaries = await prisma.beneficiary.findMany({
    where: {
      isActive: true,
      mealType: MealType.KITCHEN,
      eligibilityDays: { some: { dayOfWeek } },
    },
    include: { location: true },
    orderBy: { fullName: 'asc' },
  });

  const distributionDay = await prisma.$transaction(async (tx) => {
    let day = await tx.distributionDay.findUnique({ where: { date: dayDate } });

    if (!day) {
      day = await tx.distributionDay.create({ data: { date: dayDate, notes } });
    }

    const existingAllocations = await tx.distributionAllocation.findMany({
      where: { distributionDayId: day.id },
      select: { beneficiaryId: true },
    });

    const existingIds = new Set(existingAllocations.map((a) => a.beneficiaryId));
    const newAllocations = eligibleBeneficiaries.filter((b) => !existingIds.has(b.id));

    if (newAllocations.length > 0) {
      await tx.distributionAllocation.createMany({
        data: newAllocations.map((b) => ({
          distributionDayId: day.id,
          beneficiaryId: b.id,
          received: false,
          mealsDelivered: 0,
        })),
      });
    }

    const result = await tx.distributionDay.findUnique({
      where: { id: day.id },
      include: {
        allocations: {
          where: { beneficiary: { mealType: MealType.KITCHEN } },
          include: { beneficiary: { include: { location: true } } },
          orderBy: { beneficiary: { fullName: 'asc' } },
        },
      },
    });

    return {
      ...result,
      allocations: result!.allocations.map((a) => ({
        ...a,
        plannedMeals: a.beneficiary.maxMealsPerDay,
      })),
    };
  });

  return distributionDay;
};

// ─────────────────────────────────────────────
// GET DISTRIBUTION (Kitchen only)
// ─────────────────────────────────────────────

export const getDistribution = async (params: GetDistributionParams) => {
  const { date, sort, locationId, search } = params;

  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const distributionDay = await prisma.distributionDay.findUnique({
    where: { date: new Date(date) },
  });

  if (!distributionDay) {
    throw new AppError('Distribution day not found. Initialize it first.', 404);
  }

  const where: any = {
    distributionDayId: distributionDay.id,
    beneficiary: { mealType: MealType.KITCHEN },
  };

  if (locationId) {
    where.beneficiary.locationId = locationId;
  }

  if (search) {
    where.beneficiary.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: any = [{ beneficiary: { fullName: 'asc' } }];

  const rawAllocations = await prisma.distributionAllocation.findMany({
    where,
    include: {
      beneficiary: {
        include: { location: { select: { id: true, name: true } } },
      },
    },
    orderBy,
  });

  const allocations = rawAllocations.map((a) => ({
    ...a,
    plannedMeals: a.beneficiary.maxMealsPerDay,
    status:
      a.received === true ? 'DELIVERED' : a.mealsDelivered > 0 ? 'PARTIAL' : 'PENDING',
  }));

  return { distributionDay, allocations };
};

// ─────────────────────────────────────────────
// UPDATE ALLOCATION
// ─────────────────────────────────────────────

export const updateAllocation = async (
  allocationId: string,
  input: UpdateAllocationInput
) => {
  const existing = await prisma.distributionAllocation.findUnique({
    where: { id: allocationId },
    include: { beneficiary: { select: { maxMealsPerDay: true } } },
  });

  if (!existing) {
    throw new AppError('Allocation not found', 404);
  }

  if (
    input.mealsDelivered !== undefined &&
    input.mealsDelivered > existing.beneficiary.maxMealsPerDay
  ) {
    throw new AppError(
      `mealsDelivered (${input.mealsDelivered}) exceeds maxMealsPerDay (${existing.beneficiary.maxMealsPerDay})`,
      400
    );
  }

  if (input.mealsDelivered !== undefined && input.mealsDelivered < 0) {
    throw new AppError('mealsDelivered cannot be negative', 400);
  }

  return await prisma.distributionAllocation.update({
    where: { id: allocationId },
    data: input,
    include: {
      beneficiary: {
        include: { location: { select: { id: true, name: true } } },
      },
    },
  });
};

// ─────────────────────────────────────────────
// GET DISTRIBUTION SUMMARY
// ─────────────────────────────────────────────

export const getDistributionSummary = async (date: string) => {
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const distributionDay = await prisma.distributionDay.findUnique({
    where: { date: new Date(date) },
  });

  if (!distributionDay) {
    throw new AppError('Distribution day not found. Initialize it first.', 404);
  }

  const allAllocations = await prisma.distributionAllocation.findMany({
    where: { distributionDayId: distributionDay.id },
    include: {
      beneficiary: { select: { maxMealsPerDay: true, mealType: true } },
    },
  });

  const kitchenAllocations = allAllocations.filter(
    (a) => a.beneficiary.mealType === MealType.KITCHEN
  );
  const homeAllocations = allAllocations.filter(
    (a) => a.beneficiary.mealType === MealType.HOME
  );

  const kitchenPlannedMeals = kitchenAllocations.reduce(
    (sum, a) => sum + a.beneficiary.maxMealsPerDay, 0
  );
  const kitchenDeliveredMeals = kitchenAllocations.reduce(
    (sum, a) => sum + a.mealsDelivered, 0
  );
  const kitchenDeliveredCount = kitchenAllocations.filter((a) => a.received).length;
  const kitchenAbsentCount = kitchenAllocations.filter(
    (a) => !a.received && a.mealsDelivered === 0
  ).length;

  const homeDeliveredMeals = homeAllocations.reduce((sum, a) => sum + a.mealsDelivered, 0);

  const extraDistributions = await prisma.extraDistribution.findMany({
    where: { date: new Date(date) },
  });
  const extraMealsCount = extraDistributions.reduce((sum, e) => sum + e.mealsGiven, 0);

  return {
    date,
    kitchen: {
      plannedMeals: kitchenPlannedMeals,
      deliveredMeals: kitchenDeliveredMeals,
      deliveredCount: kitchenDeliveredCount,
      absentCount: kitchenAbsentCount,
      totalAllocations: kitchenAllocations.length,
    },
    home: {
      deliveredMeals: homeDeliveredMeals,
      deliveredCount: homeAllocations.length,
    },
    extra: {
      mealsCount: extraMealsCount,
      distributionsCount: extraDistributions.length,
    },
    grandTotal: {
      totalMealsServed: kitchenDeliveredMeals + homeDeliveredMeals + extraMealsCount,
    },
  };
};

// ─────────────────────────────────────────────
// RECORD HOME DELIVERY
// ─────────────────────────────────────────────

/**
 * Records a HOME beneficiary receiving meals.
 * Creates DistributionDay if it doesn't exist yet.
 * Allocation is created ONLY when delivery actually happens.
 */
export const recordHomeDelivery = async (
  date: string,
  input: RecordHomeDeliveryInput
) => {
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  if (input.mealsDelivered < 1) {
    throw new AppError('mealsDelivered must be at least 1', 400);
  }

  const targetDate = new Date(date);

  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: input.beneficiaryId },
    select: { id: true, fullName: true, mealType: true, isActive: true, maxMealsPerDay: true },
  });

  if (!beneficiary) throw new AppError('Beneficiary not found', 404);

  if (beneficiary.mealType !== MealType.HOME) {
    throw new AppError(
      'Beneficiary is KITCHEN type. Use the standard distribution flow instead.',
      400
    );
  }

  if (!beneficiary.isActive) throw new AppError('Beneficiary is inactive', 400);

  if (input.mealsDelivered > beneficiary.maxMealsPerDay) {
    throw new AppError(
      `mealsDelivered (${input.mealsDelivered}) exceeds maxMealsPerDay (${beneficiary.maxMealsPerDay})`,
      400
    );
  }

  return await prisma.$transaction(async (tx) => {
    let distributionDay = await tx.distributionDay.findUnique({
      where: { date: targetDate },
    });

    if (!distributionDay) {
      distributionDay = await tx.distributionDay.create({ data: { date: targetDate } });
    }

    const existingAllocation = await tx.distributionAllocation.findUnique({
      where: {
        distributionDayId_beneficiaryId: {
          distributionDayId: distributionDay.id,
          beneficiaryId: input.beneficiaryId,
        },
      },
    });

    if (existingAllocation) {
      throw new AppError(
        'Delivery for this beneficiary on this date already exists. Update the existing allocation instead.',
        409
      );
    }

    const allocation = await tx.distributionAllocation.create({
      data: {
        distributionDayId: distributionDay.id,
        beneficiaryId: input.beneficiaryId,
        received: true,
        mealsDelivered: input.mealsDelivered,
        notes: input.notes,
      },
      include: {
        beneficiary: {
          select: { id: true, fullName: true, nickName: true, mealType: true },
        },
      },
    });

    return { distributionDay, allocation };
  });
};

// ─────────────────────────────────────────────
// GET HOME DELIVERIES FOR DATE
// ─────────────────────────────────────────────

export const getHomeDeliveries = async (date: string, locationId?: string) => {
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const targetDate = new Date(date);

  const day = await prisma.distributionDay.findUnique({ where: { date: targetDate } });

  if (!day) {
    return { date: targetDate, totalDeliveries: 0, totalMeals: 0, deliveries: [] };
  }

  const deliveries = await prisma.distributionAllocation.findMany({
    where: {
      distributionDayId: day.id,
      beneficiary: {
        mealType: MealType.HOME,
        ...(locationId ? { locationId } : {}),
      },
    },
    include: {
      beneficiary: {
        include: { location: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const totalMeals = deliveries.reduce((sum, d) => sum + d.mealsDelivered, 0);

  return {
    date: day.date,
    distributionDayId: day.id,
    totalDeliveries: deliveries.length,
    totalMeals,
    deliveries,
  };
};