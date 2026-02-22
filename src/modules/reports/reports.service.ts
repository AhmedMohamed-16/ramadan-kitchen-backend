// import { prisma } from '../../shared/database/prisma';
// import { AppError } from '../../shared/middleware/error.middleware';
// import { isValidDateFormat } from '../../shared/utils/dateHelpers';
// import { Decimal } from '@prisma/client/runtime/library';

// export const getDailyReport = async (date: string) => {
//   // Validate date format
//   if (!isValidDateFormat(date)) {
//     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
//   }

//   const targetDate = new Date(date);

//   // === FINANCIAL DATA ===
  
//   // Get donations for the day
//   const donationsData = await prisma.donation.aggregate({
//     where: {
//       date: targetDate,
//     },
//     _sum: {
//       amount: true,
//     },
//     _count: true,
//   });

//   const totalDonations = donationsData._sum.amount || new Decimal(0);
//   const donationCount = donationsData._count;

//   // Get expenses for the day
//   const expensesData = await prisma.expense.aggregate({
//     where: {
//       date: targetDate,
//     },
//     _sum: {
//       amount: true,
//     },
//     _count: true,
//   });

//   const totalExpenses = expensesData._sum.amount || new Decimal(0);
//   const expenseCount = expensesData._count;

//   // === DISTRIBUTION DATA ===

//   // Get distribution day
//   const distributionDay = await prisma.distributionDay.findUnique({
//     where: { date: targetDate },
//   });

//   let distributionStats = {
//     plannedMeals: 0,
//     deliveredMeals: 0,
//     deliveredCount: 0,
//     absentCount: 0,
//     totalAllocations: 0,
//   };

//   let beneficiariesServed: any[] = [];

//   if (distributionDay) {
//     // Get all allocations
//     const allocations = await prisma.distributionAllocation.findMany({
//       where: {
//         distributionDayId: distributionDay.id,
//       },
//       include: {
//         beneficiary: {
//           select: {
//             id: true,
//             fullName: true,
//             phone: true,
//             needLevel: true,
//             maxMealsPerDay: true,
//             location: {
//               select: {
//                 name: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     // Calculate planned meals
//     const plannedMeals = allocations.reduce(
//       (sum, allocation) => sum + allocation.beneficiary.maxMealsPerDay,
//       0
//     );

//     // Calculate delivered meals
//     const deliveredMeals = allocations.reduce(
//       (sum, allocation) => sum + allocation.mealsDelivered,
//       0
//     );

//     // Count delivered and absent
//     const deliveredCount = allocations.filter((a) => a.received === true).length;
//     const absentCount = allocations.filter(
//       (a) => a.received === false && a.mealsDelivered === 0
//     ).length;

//     distributionStats = {
//       plannedMeals,
//       deliveredMeals,
//       deliveredCount,
//       absentCount,
//       totalAllocations: allocations.length,
//     };

//     // Get beneficiaries who received meals
//     beneficiariesServed = allocations
//       .filter((a) => a.received === true)
//       .map((a) => ({
//         id: a.beneficiary.id,
//         fullName: a.beneficiary.fullName,
//         phone: a.beneficiary.phone,
//         needLevel: a.beneficiary.needLevel,
//         mealsDelivered: a.mealsDelivered,
//         location: a.beneficiary.location.name,
//       }));
//   }

//   // === EXTRA DISTRIBUTIONS ===

//   const extraDistributions = await prisma.extraDistribution.findMany({
//     where: {
//       date: targetDate,
//     },
//     include: {
//       beneficiary: {
//         select: {
//           id: true,
//           fullName: true,
//           phone: true,
//           needLevel: true,
//           location: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   const extraMealsCount = extraDistributions.reduce(
//     (sum, extra) => sum + extra.mealsGiven,
//     0
//   );

//   const extraBeneficiaries = extraDistributions.map((extra) => ({
//     id: extra.beneficiary?.id || null,
//     fullName: extra.fullName,
//     phone: extra.phone || null,
//     mealsGiven: extra.mealsGiven,
//     notes: extra.notes,
//     location: extra.beneficiary?.location?.name || null,
//   }));

//   // === COMPILE REPORT ===

//   return {
//     date,
//     financial: {
//       totalDonations: Number(totalDonations),
//       donationCount,
//       totalExpenses: Number(totalExpenses),
//       expenseCount,
//       netBalance: Number(totalDonations) - Number(totalExpenses),
//     },
//     distribution: {
//       ...distributionStats,
//       extraMealsCount,
//       extraDistributionsCount: extraDistributions.length,
//       totalMealsServed: distributionStats.deliveredMeals + extraMealsCount,
//     },
//     beneficiariesServed: {
//       scheduled: beneficiariesServed,
//       extra: extraBeneficiaries,
//       totalCount: beneficiariesServed.length + extraBeneficiaries.length,
//     },
//   };
// };

// export const getPeriodReport = async (startDate: string, endDate: string) => {
//   // Validate date formats
//   if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
//     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
//   }

//   // Validate date range
//   if (new Date(startDate) > new Date(endDate)) {
//     throw new AppError('Start date must be before or equal to end date', 400);
//   }

//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   // === FINANCIAL SUMMARY ===

//   // Total donations
//   const donationsData = await prisma.donation.aggregate({
//     where: {
//       date: {
//         gte: start,
//         lte: end,
//       },
//     },
//     _sum: {
//       amount: true,
//     },
//     _count: true,
//   });

//   const totalDonations = donationsData._sum.amount || new Decimal(0);
//   const donationCount = donationsData._count;

//   // Total expenses
//   const expensesData = await prisma.expense.aggregate({
//     where: {
//       date: {
//         gte: start,
//         lte: end,
//       },
//     },
//     _sum: {
//       amount: true,
//     },
//     _count: true,
//   });

//   const totalExpenses = expensesData._sum.amount || new Decimal(0);
//   const expenseCount = expensesData._count;

//   // === DISTRIBUTION STATISTICS ===

//   // Get distribution days in period
//   const distributionDays = await prisma.distributionDay.findMany({
//     where: {
//       date: {
//         gte: start,
//         lte: end,
//       },
//     },
//     include: {
//       allocations: {
//         include: {
//           beneficiary: {
//             select: {
//               id: true,
//               maxMealsPerDay: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   // Calculate distribution statistics
//   let totalPlannedMeals = 0;
//   let totalDeliveredMeals = 0;
//   let totalDeliveredCount = 0;

//   distributionDays.forEach((day) => {
//     day.allocations.forEach((allocation) => {
//       totalPlannedMeals += allocation.beneficiary.maxMealsPerDay;
//       totalDeliveredMeals += allocation.mealsDelivered;
//       if (allocation.received) {
//         totalDeliveredCount++;
//       }
//     });
//   });

//   // Get extra distributions
//   const extraDistributionsData = await prisma.extraDistribution.aggregate({
//     where: {
//       date: {
//         gte: start,
//         lte: end,
//       },
//     },
//     _sum: {
//       mealsGiven: true,
//     },
//     _count: true,
//   });

//   const totalExtraMeals = extraDistributionsData._sum.mealsGiven || 0;
//   const extraDistributionCount = extraDistributionsData._count;

//   // === BENEFICIARY ACTIVITY ===

//   // Get unique beneficiaries served (from allocations)
//   const servedAllocations = await prisma.distributionAllocation.findMany({
//     where: {
//       distributionDay: {
//         date: {
//           gte: start,
//           lte: end,
//         },
//       },
//       received: true,
//     },
//     select: {
//       beneficiaryId: true,
//       mealsDelivered: true,
//       beneficiary: {
//         select: {
//           fullName: true,
//           phone: true,
//         },
//       },
//     },
//   });

//   // Group by beneficiary and count
//   const beneficiaryMap = new Map<string, any>();

//   servedAllocations.forEach((allocation) => {
//     const existing = beneficiaryMap.get(allocation.beneficiaryId);
//     if (existing) {
//       existing.timesServed++;
//       existing.totalMeals += allocation.mealsDelivered;
//     } else {
//       beneficiaryMap.set(allocation.beneficiaryId, {
//         beneficiaryId: allocation.beneficiaryId,
//         fullName: allocation.beneficiary.fullName,
//         phone: allocation.beneficiary.phone,
//         timesServed: 1,
//         totalMeals: allocation.mealsDelivered,
//       });
//     }
//   });

//   // Convert to array and sort by total meals
//   const beneficiaryActivity = Array.from(beneficiaryMap.values())
//     .sort((a, b) => b.totalMeals - a.totalMeals)
//     .slice(0, 10); // Top 10

//   // === COMPILE REPORT ===

//   return {
//     period: {
//       startDate,
//       endDate,
//     },
//     financialSummary: {
//       totalDonations: Number(totalDonations),
//       donationCount,
//       totalExpenses: Number(totalExpenses),
//       expenseCount,
//       remainingBalance: Number(totalDonations) - Number(totalExpenses),
//     },
//     distributionStatistics: {
//       totalDistributionDays: distributionDays.length,
//       totalPlannedMeals,
//       totalDeliveredMeals,
//       totalDeliveredCount,
//       totalExtraMeals,
//       extraDistributionCount,
//       totalMealsServed: totalDeliveredMeals + totalExtraMeals,
//     },
//     beneficiaryActivity: {
//       uniqueBeneficiariesServed: beneficiaryMap.size,
//       topBeneficiaries: beneficiaryActivity,
//     },
//   };
// };

// src/modules/reports/reports.service.ts

import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { isValidDateFormat } from '../../shared/utils/dateHelpers';
import { Decimal } from '@prisma/client/runtime/library';
import { MealType } from '@prisma/client';

export const getDailyReport = async (date: string) => {
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const targetDate = new Date(date);

  // === FINANCIAL ===
  const donationsData = await prisma.donation.aggregate({
    where: { date: targetDate },
    _sum: { amount: true },
    _count: true,
  });

  const expensesData = await prisma.expense.aggregate({
    where: { date: targetDate },
    _sum: { amount: true },
    _count: true,
  });

  const totalDonations = donationsData._sum.amount || new Decimal(0);
  const totalExpenses = expensesData._sum.amount || new Decimal(0);

  // === DISTRIBUTION ===
  const distributionDay = await prisma.distributionDay.findUnique({
    where: { date: targetDate },
  });

  // Default empty stats
  let kitchenStats = {
    plannedMeals: 0,
    deliveredMeals: 0,
    deliveredCount: 0,
    absentCount: 0,
    totalAllocations: 0,
  };
  let homeStats = { deliveredMeals: 0, deliveredCount: 0 };

  let kitchenBeneficiariesServed: any[] = [];
  let  homeBeneficiariesServed : any[] = [];
  if (distributionDay) {
    const allocations = await prisma.distributionAllocation.findMany({
      where: { distributionDayId: distributionDay.id },
      include: {
        beneficiary: {
          select: {
            id: true,
            fullName: true,
            nickName: true,
            phone: true,
            mealType: true,
            maxMealsPerDay: true,
            location: { select: { name: true } },
          },
        },
      },
    });

    const kitchenAllocations = allocations.filter(
      (a) => a.beneficiary.mealType === MealType.KITCHEN
    );
    const homeAllocations = allocations.filter(
      (a) => a.beneficiary.mealType === MealType.HOME
    );
// بعد homeAllocations
 homeBeneficiariesServed = homeAllocations.map((a) => ({
  id: a.beneficiary.id,
  fullName: a.beneficiary.fullName,
  nickName: a.beneficiary.nickName || null,
  phone: a.beneficiary.phone,
  mealsDelivered: a.mealsDelivered,
  location: a.beneficiary.location.name,
}));
    kitchenStats = {
      plannedMeals: kitchenAllocations.reduce(
        (sum, a) => sum + a.beneficiary.maxMealsPerDay, 0
      ),
      deliveredMeals: kitchenAllocations.reduce((sum, a) => sum + a.mealsDelivered, 0),
      deliveredCount: kitchenAllocations.filter((a) => a.received).length,
      absentCount: kitchenAllocations.filter(
        (a) => !a.received && a.mealsDelivered === 0
      ).length,
      totalAllocations: kitchenAllocations.length,
    };

    homeStats = {
      deliveredMeals: homeAllocations.reduce((sum, a) => sum + a.mealsDelivered, 0),
      deliveredCount: homeAllocations.length,
    };

    kitchenBeneficiariesServed = kitchenAllocations
      .filter((a) => a.received)
      .map((a) => ({
        id: a.beneficiary.id,
        fullName: a.beneficiary.fullName,
        nickName: a.beneficiary.nickName || null,
        phone: a.beneficiary.phone,
        mealsDelivered: a.mealsDelivered,
        location: a.beneficiary.location.name,
      }));
  }

  // === EXTRA DISTRIBUTIONS ===
  const extraDistributions = await prisma.extraDistribution.findMany({
    where: { date: targetDate },
    include: {
      beneficiary: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          location: { select: { name: true } },
        },
      },
    },
  });

  const extraMealsCount = extraDistributions.reduce((sum, e) => sum + e.mealsGiven, 0);

  const extraBeneficiaries = extraDistributions.map((extra) => ({
    id: extra.beneficiary?.id || null,
    fullName: extra.fullName,
    phone: extra.phone || null,
    mealsGiven: extra.mealsGiven,
    notes: extra.notes,
    location: extra.beneficiary?.location?.name || null,
  }));

  return {
    date,
    financial: {
      totalDonations: Number(totalDonations),
      donationCount: donationsData._count,
      totalExpenses: Number(totalExpenses),
      expenseCount: expensesData._count,
      netBalance: Number(totalDonations) - Number(totalExpenses),
    },
    kitchen: {
      ...kitchenStats,
      extraMealsCount,
      extraDistributionsCount: extraDistributions.length,
      totalMealsServed: kitchenStats.deliveredMeals + extraMealsCount,
    },
    home: homeStats,
    grandTotal: {
      totalBeneficiariesServed:
        kitchenStats.deliveredCount + homeStats.deliveredCount,
      totalMealsServed:
        kitchenStats.deliveredMeals + homeStats.deliveredMeals + extraMealsCount,
    },
    beneficiariesServed: {
      kitchen: kitchenBeneficiariesServed,
      extra: extraBeneficiaries,
      totalCount: kitchenBeneficiariesServed.length + extraBeneficiaries.length,
      home: homeBeneficiariesServed,   
    },
  };
};

export const getPeriodReport = async (startDate: string, endDate: string) => {
  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new AppError('Start date must be before or equal to end date', 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateFilter = { gte: start, lte: end };

  const [donationsData, expensesData, allAllocations, extraData] =
    await Promise.all([
      prisma.donation.aggregate({
        where: { date: dateFilter },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { date: dateFilter },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.distributionAllocation.findMany({
        where: { distributionDay: { date: dateFilter } },
        select: {
          received: true,
          mealsDelivered: true,
          beneficiaryId: true,
          beneficiary: {
            select: {
              mealType: true,
              maxMealsPerDay: true,
              fullName: true,
              phone: true,
            },
          },
        },
      }),
      prisma.extraDistribution.aggregate({
        where: { date: dateFilter },
        _sum: { mealsGiven: true },
        _count: true,
      }),
    ]);

  const kitchenAllocations = allAllocations.filter(
    (a) => a.beneficiary.mealType === MealType.KITCHEN
  );
  const homeAllocations = allAllocations.filter(
    (a) => a.beneficiary.mealType === MealType.HOME
  );
 

  // Top beneficiaries (kitchen, received meals)
  const beneficiaryMap = new Map<string, any>();

// Kitchen allocations
kitchenAllocations
  .filter((a) => a.received)
  .forEach((a) => {
    const existing = beneficiaryMap.get(a.beneficiaryId);
    if (existing) {
      existing.timesServed++;
      existing.totalMeals += a.mealsDelivered;
    } else {
      beneficiaryMap.set(a.beneficiaryId, {
        beneficiaryId: a.beneficiaryId,
        fullName: a.beneficiary.fullName,
        phone: a.beneficiary.phone,
        timesServed: 1,
        totalMeals: a.mealsDelivered,
        mealType: 'KITCHEN',
      });
    }
  });

// Home allocations
homeAllocations.forEach((a) => {
  const existing = beneficiaryMap.get(a.beneficiaryId);
  if (existing) {
    existing.timesServed++;
    existing.totalMeals += a.mealsDelivered;
  } else {
    beneficiaryMap.set(a.beneficiaryId, {
      beneficiaryId: a.beneficiaryId,
      fullName: a.beneficiary.fullName,
      phone: a.beneficiary.phone,
      timesServed: 1,
      totalMeals: a.mealsDelivered,
      mealType: 'HOME',
    });
  }
});


  const topBeneficiaries = Array.from(beneficiaryMap.values())
    .sort((a, b) => b.totalMeals - a.totalMeals)
    .slice(0, 10);

  const totalDonations = donationsData._sum.amount || new Decimal(0);
  const totalExpenses = expensesData._sum.amount || new Decimal(0);
  const totalExtraMeals = extraData._sum.mealsGiven || 0;

  const kitchenDeliveredMeals = kitchenAllocations.reduce(
    (sum, a) => sum + a.mealsDelivered, 0
  );
  const homeDeliveredMeals = homeAllocations.reduce(
    (sum, a) => sum + a.mealsDelivered, 0
  );



  // In getPeriodReport, replace the return with:
return {
  period: { startDate, endDate },
   financialSummary: {
      totalDonations: Number(totalDonations),
      donationCount: donationsData._count,
      totalExpenses: Number(totalExpenses),
      expenseCount: expensesData._count,
      remainingBalance: Number(totalDonations) - Number(totalExpenses),
    }, // already correct
  distributionStatistics: {
    totalDistributionDays: 0, // add this query or compute it
    totalPlannedMeals: kitchenAllocations.reduce((sum, a) => sum + a.beneficiary.maxMealsPerDay, 0),
    totalDeliveredMeals: kitchenDeliveredMeals + homeDeliveredMeals,
    totalExtraMeals: totalExtraMeals,
    totalMealsServed: kitchenDeliveredMeals + homeDeliveredMeals + totalExtraMeals,
  },
  beneficiaryActivity: {
    uniqueBeneficiariesServed: beneficiaryMap.size, // renamed
    topBeneficiaries,
  },
     
    kitchen: {
      totalAllocations: kitchenAllocations.length,
      totalDeliveredCount: kitchenAllocations.filter((a) => a.received).length,
      totalPlannedMeals: kitchenAllocations.reduce(
        (sum, a) => sum + a.beneficiary.maxMealsPerDay, 0
      ),
      totalDeliveredMeals: kitchenDeliveredMeals,
    },
    home: {
      totalDeliveries: homeAllocations.length,
      totalDeliveredMeals: homeDeliveredMeals,
    },
    extra: {
      count: extraData._count,
      totalMeals: totalExtraMeals,
    },
    grandTotal: {
      totalMealsServed: kitchenDeliveredMeals + homeDeliveredMeals + totalExtraMeals,
    }
};
};