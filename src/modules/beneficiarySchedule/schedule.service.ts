// import { log } from 'console';
// import { prisma } from '../../shared/database/prisma';
// import { AppError } from '../../shared/middleware/error.middleware';

// export const getSchedule = async (beneficiaryId: string) => {
//   // Check if beneficiary exists
//   const beneficiary = await prisma.beneficiary.findUnique({
//     where: { id: beneficiaryId },
//   });

//   if (!beneficiary) {
//     throw new AppError('Beneficiary not found', 404);
//   }

//   const schedule = await prisma.beneficiaryEligibilityDay.findMany({
//     where: { beneficiaryId },
//     orderBy: { dayOfWeek: 'asc' },
//     select: {
//       dayOfWeek: true,
//     },
//   });

//   return {
//     beneficiaryId,
//     days: schedule.map((s) => s.dayOfWeek),
//   };
// };

// export const updateSchedule = async (
//   beneficiaryId: string,
//   days: number[]
// ) => {
//   // Check if beneficiary exists
//   const beneficiary = await prisma.beneficiary.findUnique({
//     where: { id: beneficiaryId },
//   });

//   if (!beneficiary) {
//     throw new AppError('Beneficiary not found', 404);
//   }

//   const today = new Date();
//   const todayDateOnly = new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate()
//   );
//   const todayDayOfWeek = today.getDay(); // 0-6

//   await prisma.$transaction(async (tx) => {
//     // ─────────────────────────────
//     // 1️⃣ Update schedule
//     // ─────────────────────────────
//     await tx.beneficiaryEligibilityDay.deleteMany({
//       where: { beneficiaryId },
//     });

//     if (days.length > 0) {
//       await tx.beneficiaryEligibilityDay.createMany({
//         data: days.map((dayOfWeek) => ({
//           beneficiaryId,
//           dayOfWeek,
//         })),
//       });
//     }

//     // ─────────────────────────────
//     // 2️⃣ Check if today has distribution
//     // ─────────────────────────────
//     const startOfDay = new Date(todayDateOnly);
// const endOfDay = new Date(todayDateOnly);
// endOfDay.setDate(endOfDay.getDate() + 1);

// const todayDistribution = await tx.distributionDay.findFirst({
//   where: {
//     date: {
//       gte: startOfDay,
//       lt: endOfDay,
//     },
//   },
// });

//     if (!todayDistribution) return;

//     const existingAllocation =
//       await tx.distributionAllocation.findFirst({
//         where: {
//           distributionDayId: todayDistribution.id,
//           beneficiaryId,
//         },
//       });

//     const shouldBeEligible = days.includes(todayDayOfWeek);

//     // ─────────────────────────────
//     // 3️⃣ Add if became eligible
//     // ─────────────────────────────
//     if (shouldBeEligible && !existingAllocation && beneficiary.isActive) {
//       await tx.distributionAllocation.create({
//         data: {
//           distributionDayId: todayDistribution.id,
//           beneficiaryId,
//           received: false,
//           mealsDelivered: 0,
//         },
//       });
//     }

//     // ─────────────────────────────
//     // 4️⃣ Remove if no longer eligible
//     // (only if NOT delivered)
//     // ─────────────────────────────
//     if (
//       !shouldBeEligible &&
//       existingAllocation &&
//       existingAllocation.received === false &&
//       existingAllocation.mealsDelivered === 0
//     ) {
//       await tx.distributionAllocation.delete({
//         where: {
//           id: existingAllocation.id,
//         },
//       });
//     }
//   });
// log("ben",{
//     beneficiaryId,
//     days,
//   })
//   return {
//     beneficiaryId,
//     days,
//   };
// };
// src/modules/distribution/schedule.service.ts

import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { MealType } from '@prisma/client';

export const getSchedule = async (beneficiaryId: string) => {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: beneficiaryId },
  });

  if (!beneficiary) {
    throw new AppError('Beneficiary not found', 404);
  }

  const schedule = await prisma.beneficiaryEligibilityDay.findMany({
    where: { beneficiaryId },
    orderBy: { dayOfWeek: 'asc' },
    select: { dayOfWeek: true },
  });

  return {
    beneficiaryId,
    days: schedule.map((s) => s.dayOfWeek),
  };
};

export const updateSchedule = async (beneficiaryId: string, days: number[]) => {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: beneficiaryId },
  });

  if (!beneficiary) {
    throw new AppError('Beneficiary not found', 404);
  }

  // HOME beneficiaries must NOT have a schedule
  // They receive meals on-demand via the home delivery endpoint
  if (beneficiary.mealType === MealType.HOME) {
    throw new AppError(
      'Cannot assign a schedule to a HOME meal beneficiary. ' +
      'HOME beneficiaries do not follow a fixed eligibility schedule. ' +
      'Use POST /distribution/:date/home to record their meals.',
      400
    );
  }

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayDayOfWeek = today.getDay();

  await prisma.$transaction(async (tx) => {
    // 1. Replace schedule
    await tx.beneficiaryEligibilityDay.deleteMany({ where: { beneficiaryId } });

    if (days.length > 0) {
      await tx.beneficiaryEligibilityDay.createMany({
        data: days.map((dayOfWeek) => ({ beneficiaryId, dayOfWeek })),
      });
    }

    // 2. Sync today's distribution if it exists
    const startOfDay = new Date(todayDateOnly);
    const endOfDay = new Date(todayDateOnly);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todayDistribution = await tx.distributionDay.findFirst({
      where: { date: { gte: startOfDay, lt: endOfDay } },
    });

    if (!todayDistribution) return;

    const existingAllocation = await tx.distributionAllocation.findFirst({
      where: { distributionDayId: todayDistribution.id, beneficiaryId },
    });

    const shouldBeEligible = days.includes(todayDayOfWeek);

    // Add if became eligible today
    if (shouldBeEligible && !existingAllocation && beneficiary.isActive) {
      await tx.distributionAllocation.create({
        data: {
          distributionDayId: todayDistribution.id,
          beneficiaryId,
          received: false,
          mealsDelivered: 0,
        },
      });
    }

    // Remove if no longer eligible AND not yet delivered
    if (
      !shouldBeEligible &&
      existingAllocation &&
      existingAllocation.received === false &&
      existingAllocation.mealsDelivered === 0
    ) {
      await tx.distributionAllocation.delete({ where: { id: existingAllocation.id } });
    }
  });

  return { beneficiaryId, days };
};