// // import ExcelJS from 'exceljs';
// // import { createWorkbook, addHeaderRow } from '../../shared/utils/excel.util';
// // import { getPagination } from '../../shared/utils/pagination.util';
// // import { isValidDateFormat } from '../../shared/utils/dateHelpers';
// // import { AppError } from '../../shared/middleware/error.middleware';

// // // Import existing services (REUSE, DO NOT DUPLICATE)
// // import * as reportsService from '../reports/reports.service';
// // import { prisma } from '../../shared/database/prisma';

// // export const exportDonations = async (startDate?: string, endDate?: string) => {
// //   // Build where clause
// //   const where: any = {};

// //   if (startDate || endDate) {
// //     where.date = {};
// //     if (startDate) {
// //       if (!isValidDateFormat(startDate)) {
// //         throw new AppError('Invalid start date format', 400);
// //       }
// //       where.date.gte = new Date(startDate);
// //     }
// //     if (endDate) {
// //       if (!isValidDateFormat(endDate)) {
// //         throw new AppError('Invalid end date format', 400);
// //       }
// //       where.date.lte = new Date(endDate);
// //     }
// //   }

// //   // Get donations with donor info
// //   const donations = await prisma.donation.findMany({
// //     where,
// //     include: {
// //       donor: {
// //         select: {
// //           fullName: true,
// //           phone: true,
// //           location: {
// //             select: {
// //               name: true,
// //             },
// //           },
// //         },
// //       },
// //     },
// //     orderBy: { date: 'desc' },
// //   });

// //   // Create workbook
// //   const workbook = createWorkbook();
// //   const worksheet = workbook.addWorksheet('Donations');

// //   // Add headers
// //   addHeaderRow(worksheet, [
// //     'Date',
// //     'Donor Name',
// //     'Phone',
// //     'Location',
// //     'Amount',
// //     'Payment Method',
// //     'Notes',
// //   ]);

// //   // Add data rows
// //   donations.forEach((donation) => {
// //     worksheet.addRow([
// //       donation.date.toISOString().split('T')[0],
// //       donation.donor.fullName,
// //       donation.donor.phone,
// //       donation.donor.location.name,
// //       Number(donation.amount),
// //       donation.paymentMethod || '',
// //       donation.notes || '',
// //     ]);
// //   });

// //   // Auto-fit columns
// //   worksheet.columns.forEach((column) => {
// //     if (column) {
// //       column.width = 15;
// //     }
// //   });

// //   return workbook;
// // };

// // export const exportExpenses = async (startDate?: string, endDate?: string) => {
// //   // Build where clause
// //   const where: any = {};

// //   if (startDate || endDate) {
// //     where.date = {};
// //     if (startDate) {
// //       if (!isValidDateFormat(startDate)) {
// //         throw new AppError('Invalid start date format', 400);
// //       }
// //       where.date.gte = new Date(startDate);
// //     }
// //     if (endDate) {
// //       if (!isValidDateFormat(endDate)) {
// //         throw new AppError('Invalid end date format', 400);
// //       }
// //       where.date.lte = new Date(endDate);
// //     }
// //   }

// //   // Get expenses
// //   const expenses = await prisma.expense.findMany({
// //     where,
// //     orderBy: { date: 'desc' },
// //   });

// //   // Create workbook
// //   const workbook = createWorkbook();
// //   const worksheet = workbook.addWorksheet('Expenses');

// //   // Add headers
// //   addHeaderRow(worksheet, [
// //     'Date',
// //     'Name',
// //     'Category',
// //     'Amount',
// //     'Description',
// //   ]);

// //   // Add data rows
// //   expenses.forEach((expense) => {
// //     worksheet.addRow([
// //       expense.date.toISOString().split('T')[0],
// //       expense.name,
// //       expense.category,
// //       Number(expense.amount),
// //       expense.description || '',
// //     ]);
// //   });

// //   // Auto-fit columns
// //   worksheet.columns.forEach((column) => {
// //     if (column) {
// //       column.width = 15;
// //     }
// //   });

// //   return workbook;
// // };

// // export const exportDistribution = async (date: string) => {
// //   if (!isValidDateFormat(date)) {
// //     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
// //   }

// //   const targetDate = new Date(date);

// //   // Get distribution day
// //   const distributionDay = await prisma.distributionDay.findUnique({
// //     where: { date: targetDate },
// //   });

// //   if (!distributionDay) {
// //     throw new AppError('Distribution day not found', 404);
// //   }

// //   // Get allocations
// //   const allocations = await prisma.distributionAllocation.findMany({
// //     where: {
// //       distributionDayId: distributionDay.id,
// //     },
// //     include: {
// //       beneficiary: {
// //         include: {
// //           location: {
// //             select: {
// //               name: true,
// //             },
// //           },
// //         },
// //       },
// //     },
// //     orderBy: [
// //       { beneficiary: { needLevel: 'desc' } },
// //       { beneficiary: { fullName: 'asc' } },
// //     ],
// //   });

// //   // Create workbook
// //   const workbook = createWorkbook();
// //   const worksheet = workbook.addWorksheet('Distribution');

// //   // Add headers
// //   addHeaderRow(worksheet, [
// //     'Beneficiary Name',
// //     'Phone',
// //     'Location',
// //     'Need Level',
// //     'Max Meals/Day',
// //     'Received',
// //     'Meals Delivered',
// //     'Notes',
// //   ]);

// //   // Add data rows
// //   allocations.forEach((allocation) => {
// //     worksheet.addRow([
// //       allocation.beneficiary.fullName,
// //       allocation.beneficiary.phone,
// //       allocation.beneficiary.location.name,
// //       allocation.beneficiary.needLevel,
// //       allocation.beneficiary.maxMealsPerDay,
// //       allocation.received ? 'Yes' : 'No',
// //       allocation.mealsDelivered,
// //       allocation.notes || '',
// //     ]);
// //   });

// //   // Auto-fit columns
// //   worksheet.columns.forEach((column) => {
// //     if (column) {
// //       column.width = 15;
// //     }
// //   });

// //   return workbook;
// // };

// // export const exportDailyReport = async (date: string) => {
// //   // REUSE existing report service
// //   const report = await reportsService.getDailyReport(date);

// //   // Create workbook
// //   const workbook = createWorkbook();

// //   // === SHEET 1: Summary ===
// //   const summarySheet = workbook.addWorksheet('Summary');
  
// //   addHeaderRow(summarySheet, ['Metric', 'Value']);
  
// //   summarySheet.addRow(['Date', report.date]);
// //   summarySheet.addRow(['']); // Empty row
  
// //   summarySheet.addRow(['FINANCIAL']);
// //   summarySheet.addRow(['Total Donations', report.financial.totalDonations]);
// //   summarySheet.addRow(['Donation Count', report.financial.donationCount]);
// //   summarySheet.addRow(['Total Expenses', report.financial.totalExpenses]);
// //   summarySheet.addRow(['Expense Count', report.financial.expenseCount]);
// //   summarySheet.addRow(['Net Balance', report.financial.netBalance]);
// //   summarySheet.addRow(['']); // Empty row
  
// //   summarySheet.addRow(['DISTRIBUTION']);
// //   summarySheet.addRow(['Planned Meals', report.distribution.plannedMeals]);
// //   summarySheet.addRow(['Delivered Meals', report.distribution.deliveredMeals]);
// //   summarySheet.addRow(['Delivered Count', report.distribution.deliveredCount]);
// //   summarySheet.addRow(['Absent Count', report.distribution.absentCount]);
// //   summarySheet.addRow(['Extra Meals', report.distribution.extraMealsCount]);
// //   summarySheet.addRow(['Total Meals Served', report.distribution.totalMealsServed]);
  
// //   summarySheet.columns.forEach((column) => {
// //     if (column) {
// //       column.width = 20;
// //     }
// //   });

// //   // === SHEET 2: Beneficiaries Served ===
// //   const beneficiariesSheet = workbook.addWorksheet('Beneficiaries Served');
  
// //   addHeaderRow(beneficiariesSheet, [
// //     'Name',
// //     'Phone',
// //     'Need Level',
// //     'Meals Delivered',
// //     'Location',
// //     'Type',
// //   ]);

// //   // Scheduled beneficiaries
// //   report.beneficiariesServed.scheduled.forEach((ben) => {
// //     beneficiariesSheet.addRow([
// //       ben.fullName,
// //       ben.phone,
// //       ben.needLevel,
// //       ben.mealsDelivered,
// //       ben.location,
// //       'Scheduled',
// //     ]);
// //   });

// //   // Extra beneficiaries
// //   report.beneficiariesServed.extra.forEach((ben) => {
// //     beneficiariesSheet.addRow([
// //       ben.fullName,
// //       ben.phone || '',
// //       '',
// //       ben.mealsGiven,
// //       ben.location || '',
// //       'Extra',
// //     ]);
// //   });

// //   beneficiariesSheet.columns.forEach((column) => {
// //     if (column) {
// //       column.width = 18;
// //     }
// //   });

// //   return workbook;
// // };

// // export const exportPeriodReport = async (startDate: string, endDate: string) => {
// //   // REUSE existing report service
// //   const report = await reportsService.getPeriodReport(startDate, endDate);

// //   // Create workbook
// //   const workbook = createWorkbook();

// //   // === SHEET 1: Summary ===
// //   const summarySheet = workbook.addWorksheet('Summary');
  
// //   addHeaderRow(summarySheet, ['Metric', 'Value']);
  
// //   summarySheet.addRow(['Period Start', report.period.startDate]);
// //   summarySheet.addRow(['Period End', report.period.endDate]);
// //   summarySheet.addRow(['']); // Empty row
  
// //   summarySheet.addRow(['FINANCIAL SUMMARY']);
// //   summarySheet.addRow(['Total Donations', report.financialSummary.totalDonations]);
// //   summarySheet.addRow(['Donation Count', report.financialSummary.donationCount]);
// //   summarySheet.addRow(['Total Expenses', report.financialSummary.totalExpenses]);
// //   summarySheet.addRow(['Expense Count', report.financialSummary.expenseCount]);
// //   summarySheet.addRow(['Remaining Balance', report.financialSummary.remainingBalance]);
// //   summarySheet.addRow(['']); // Empty row
  
// //   summarySheet.addRow(['DISTRIBUTION STATISTICS']);
// //   summarySheet.addRow(['Distribution Days', report.distributionStatistics.totalDistributionDays]);
// //   summarySheet.addRow(['Planned Meals', report.distributionStatistics.totalPlannedMeals]);
// //   summarySheet.addRow(['Delivered Meals', report.distributionStatistics.totalDeliveredMeals]);
// //   summarySheet.addRow(['Extra Meals', report.distributionStatistics.totalExtraMeals]);
// //   summarySheet.addRow(['Total Meals Served', report.distributionStatistics.totalMealsServed]);
// //   summarySheet.addRow(['']); // Empty row
  
// //   summarySheet.addRow(['BENEFICIARY ACTIVITY']);
// //   summarySheet.addRow(['Unique Beneficiaries', report.beneficiaryActivity.uniqueBeneficiariesServed]);
  
// //   summarySheet.columns.forEach((column) => {
// //     if (column) {
// //       column.width = 25;
// //     }
// //   });

// //   // === SHEET 2: Top Beneficiaries ===
// //   const topBeneficiariesSheet = workbook.addWorksheet('Top Beneficiaries');
  
// //   addHeaderRow(topBeneficiariesSheet, [
// //     'Name',
// //     'Phone',
// //     'Times Served',
// //     'Total Meals',
// //   ]);

// //   report.beneficiaryActivity.topBeneficiaries.forEach((ben) => {
// //     topBeneficiariesSheet.addRow([
// //       ben.fullName,
// //       ben.phone,
// //       ben.timesServed,
// //       ben.totalMeals,
// //     ]);
// //   });

// //   topBeneficiariesSheet.columns.forEach((column) => {
// //     if (column) {
// //       column.width = 18;
// //     }
// //   });

// //   return workbook;
// // };

// import ExcelJS from 'exceljs';
// import { createWorkbook, addHeaderRow } from '../../shared/utils/excel.util';
// import { isValidDateFormat } from '../../shared/utils/dateHelpers';
// import { AppError } from '../../shared/middleware/error.middleware';
// import { prisma } from '../../shared/database/prisma';
// import * as reportsService from '../reports/reports.service';
// export const exportDonations = async (startDate?: string, endDate?: string) => {
//   // Build where clause
//   const where: any = {};

//   if (startDate || endDate) {
//     where.date = {};
//     if (startDate) {
//       if (!isValidDateFormat(startDate)) {
//         throw new AppError('Invalid start date format', 400);
//       }
//       where.date.gte = new Date(startDate);
//     }
//     if (endDate) {
//       if (!isValidDateFormat(endDate)) {
//         throw new AppError('Invalid end date format', 400);
//       }
//       where.date.lte = new Date(endDate);
//     }
//   }

//   // Get donations with donor info
//   const donations = await prisma.donation.findMany({
//     where,
//     include: {
//       donor: {
//         select: {
//           fullName: true,
//           phone: true,
//           location: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: { date: 'desc' },
//   });

//   // Create workbook
//   const workbook = createWorkbook();
//   const worksheet = workbook.addWorksheet('Donations');

//   // Add headers
//   addHeaderRow(worksheet, [
//     'Date',
//     'Donor Name',
//     'Phone',
//     'Location',
//     'Amount',
//     'Payment Method',
//     'Notes',
//   ]);

//   // Add data rows
//   donations.forEach((donation) => {
//     worksheet.addRow([
//       donation.date.toISOString().split('T')[0],
//       donation.donor.fullName,
//       donation.donor.phone,
//       donation.donor.location.name,
//       Number(donation.amount),
//       donation.paymentMethod || '',
//       donation.notes || '',
//     ]);
//   });

//   // Auto-fit columns
//   worksheet.columns.forEach((column) => {
//     if (column) {
//       column.width = 15;
//     }
//   });

//   return workbook;
// };

// export const exportExpenses = async (startDate?: string, endDate?: string) => {
//   // Build where clause
//   const where: any = {};

//   if (startDate || endDate) {
//     where.date = {};
//     if (startDate) {
//       if (!isValidDateFormat(startDate)) {
//         throw new AppError('Invalid start date format', 400);
//       }
//       where.date.gte = new Date(startDate);
//     }
//     if (endDate) {
//       if (!isValidDateFormat(endDate)) {
//         throw new AppError('Invalid end date format', 400);
//       }
//       where.date.lte = new Date(endDate);
//     }
//   }

//   // Get expenses
//   const expenses = await prisma.expense.findMany({
//     where,
//     orderBy: { date: 'desc' },
//   });

//   // Create workbook
//   const workbook = createWorkbook();
//   const worksheet = workbook.addWorksheet('Expenses');

//   // Add headers
//   addHeaderRow(worksheet, [
//     'Date',
//     'Name',
//     'Category',
//     'Amount',
//     'Description',
//   ]);

//   // Add data rows
//   expenses.forEach((expense) => {
//     worksheet.addRow([
//       expense.date.toISOString().split('T')[0],
//       expense.name,
//       expense.category,
//       Number(expense.amount),
//       expense.description || '',
//     ]);
//   });

//   // Auto-fit columns
//   worksheet.columns.forEach((column) => {
//     if (column) {
//       column.width = 15;
//     }
//   });

//   return workbook;
// };

// export const exportDistribution = async (date: string) => {
//   if (!isValidDateFormat(date)) {
//     throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
//   }

//   const targetDate = new Date(date);

//   // Get distribution day
//   const distributionDay = await prisma.distributionDay.findUnique({
//     where: { date: targetDate },
//   });

//   if (!distributionDay) {
//     throw new AppError('Distribution day not found', 404);
//   }

//   // Get allocations
//   const allocations = await prisma.distributionAllocation.findMany({
//     where: {
//       distributionDayId: distributionDay.id,
//     },
//     include: {
//       beneficiary: {
//         include: {
//           location: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: [
//       { beneficiary: { needLevel: 'desc' } },
//       { beneficiary: { fullName: 'asc' } },
//     ],
//   });

//   // Create workbook
//   const workbook = createWorkbook();
//   const worksheet = workbook.addWorksheet('Distribution');

//   // Add headers
//   addHeaderRow(worksheet, [
//     'Beneficiary Name',
//     'Phone',
//     'Location',
//     'Need Level',
//     'Max Meals/Day',
//     'Received',
//     'Meals Delivered',
//     'Notes',
//   ]);

//   // Add data rows
//   allocations.forEach((allocation) => {
//     worksheet.addRow([
//       allocation.beneficiary.fullName,
//       allocation.beneficiary.phone,
//       allocation.beneficiary.location.name,
//       allocation.beneficiary.needLevel,
//       allocation.beneficiary.maxMealsPerDay,
//       allocation.received ? 'Yes' : 'No',
//       allocation.mealsDelivered,
//       allocation.notes || '',
//     ]);
//   });

//   // Auto-fit columns
//   worksheet.columns.forEach((column) => {
//     if (column) {
//       column.width = 15;
//     }
//   });

//   return workbook;
// };

// /**
//  * تصدير التقرير اليومي الكامل
//  * يشمل: التبرعات، المصروفات، والتوزيع
//  */
// export const exportDailyReport = async (date: string) => {
//   if (!isValidDateFormat(date)) {
//     throw new AppError('صيغة التاريخ غير صحيحة. استخدم YYYY-MM-DD', 400);
//   }

//   const report = await reportsService.getDailyReport(date);

//   const workbook = createWorkbook();

//   // ======================= شيت الملخص =======================
//   const summarySheet = workbook.addWorksheet('ملخص التقرير');
  
//   addHeaderRow(summarySheet, ['المعيار', 'القيمة']);

//   summarySheet.addRow(['التاريخ', report.date]);
//   summarySheet.addRow(['']); // صف فارغ

//   summarySheet.addRow(['الجانب المالي']);
//   summarySheet.addRow(['إجمالي التبرعات', report.financial.totalDonations]);
//   summarySheet.addRow(['عدد التبرعات', report.financial.donationCount]);
//   summarySheet.addRow(['إجمالي المصروفات', report.financial.totalExpenses]);
//   summarySheet.addRow(['عدد المصروفات', report.financial.expenseCount]);
//   summarySheet.addRow(['صافي الرصيد', report.financial.netBalance]);
//   summarySheet.addRow(['']); // صف فارغ

//   summarySheet.addRow(['الجانب التوزيعي']);
//   summarySheet.addRow(['الوجبات المخطط لها', report.distribution.plannedMeals]);
//   summarySheet.addRow(['الوجبات الموزعة', report.distribution.deliveredMeals]);
//   summarySheet.addRow(['عدد المستلمين', report.distribution.deliveredCount]);
//   summarySheet.addRow(['عدد الغائبين', report.distribution.absentCount]);
//   summarySheet.addRow(['الوجبات الإضافية', report.distribution.extraMealsCount]);
//   summarySheet.addRow(['إجمالي الوجبات المقدمة', report.distribution.totalMealsServed]);

//   summarySheet.columns.forEach((col) => col.width = 25);

//   // ======================= شيت التبرعات =======================
//   const donations = await prisma.donation.findMany({
//     where: { date: new Date(date) },
//     include: { donor: { select: { fullName: true, phone: true, location: { select: { name: true } } } } },
//     orderBy: { date: 'desc' },
//   });

//   const donationSheet = workbook.addWorksheet('التبرعات');
//   addHeaderRow(donationSheet, [
//     'التاريخ',
//     'اسم المتبرع',
//     'الهاتف',
//     'الموقع',
//     'المبلغ',
//     'طريقة الدفع',
//     'ملاحظات',
//   ]);

//   donations.forEach((don) => {
//     donationSheet.addRow([
//       don.date.toISOString().split('T')[0],
//       don.donor.fullName,
//       don.donor.phone,
//       don.donor.location.name,
//       Number(don.amount),
//       don.paymentMethod || '',
//       don.notes || '',
//     ]);
//   });

//   donationSheet.columns.forEach((col) => col.width = 18);

//   // ======================= شيت المصروفات =======================
//   const expenses = await prisma.expense.findMany({
//     where: { date: new Date(date) },
//     orderBy: { date: 'desc' },
//   });

//   const expenseSheet = workbook.addWorksheet('المصروفات');
//   addHeaderRow(expenseSheet, ['التاريخ', 'الاسم', 'الفئة', 'المبلغ', 'الوصف']);

//   expenses.forEach((exp) => {
//     expenseSheet.addRow([
//       exp.date.toISOString().split('T')[0],
//       exp.name,
//       exp.category,
//       Number(exp.amount),
//       exp.description || '',
//     ]);
//   });

//   expenseSheet.columns.forEach((col) => col.width = 18);

//   // ======================= شيت التوزيع =======================
//   const distributionDay = await prisma.distributionDay.findUnique({ where: { date: new Date(date) } });
//   if (distributionDay) {
//     const allocations = await prisma.distributionAllocation.findMany({
//       where: { distributionDayId: distributionDay.id },
//       include: { beneficiary: { include: { location: { select: { name: true } } } } },
//       orderBy: [
//         { beneficiary: { needLevel: 'desc' } },
//         { beneficiary: { fullName: 'asc' } },
//       ],
//     });

//     const distributionSheet = workbook.addWorksheet('التوزيع');
//     addHeaderRow(distributionSheet, [
//       'اسم المستفيد',
//       'الهاتف',
//       'الموقع',
//       'درجة الحاجة',
//       'أقصى وجبات/اليوم',
//       'استلم',
//       'عدد الوجبات الموزعة',
//       'ملاحظات',
//     ]);

//     allocations.forEach((alloc) => {
//       distributionSheet.addRow([
//         alloc.beneficiary.fullName,
//         alloc.beneficiary.phone,
//         alloc.beneficiary.location.name,
//         alloc.beneficiary.needLevel,
//         alloc.beneficiary.maxMealsPerDay,
//         alloc.received ? 'نعم' : 'لا',
//         alloc.mealsDelivered,
//         alloc.notes || '',
//       ]);
//     });

//     distributionSheet.columns.forEach((col) => col.width = 20);
//   }

//   return workbook;
// };

// export const exportPeriodReport = async (startDate: string, endDate: string) => {
//   // REUSE existing report service
//   const report = await reportsService.getPeriodReport(startDate, endDate);

//   // Create workbook
//   const workbook = createWorkbook();

//   // === SHEET 1: Summary ===
//   const summarySheet = workbook.addWorksheet('Summary');
  
//   addHeaderRow(summarySheet, ['Metric', 'Value']);
  
//   summarySheet.addRow(['Period Start', report.period.startDate]);
//   summarySheet.addRow(['Period End', report.period.endDate]);
//   summarySheet.addRow(['']); // Empty row
  
//   summarySheet.addRow(['FINANCIAL SUMMARY']);
//   summarySheet.addRow(['Total Donations', report.financialSummary.totalDonations]);
//   summarySheet.addRow(['Donation Count', report.financialSummary.donationCount]);
//   summarySheet.addRow(['Total Expenses', report.financialSummary.totalExpenses]);
//   summarySheet.addRow(['Expense Count', report.financialSummary.expenseCount]);
//   summarySheet.addRow(['Remaining Balance', report.financialSummary.remainingBalance]);
//   summarySheet.addRow(['']); // Empty row
  
//   summarySheet.addRow(['DISTRIBUTION STATISTICS']);
//   summarySheet.addRow(['Distribution Days', report.distributionStatistics.totalDistributionDays]);
//   summarySheet.addRow(['Planned Meals', report.distributionStatistics.totalPlannedMeals]);
//   summarySheet.addRow(['Delivered Meals', report.distributionStatistics.totalDeliveredMeals]);
//   summarySheet.addRow(['Extra Meals', report.distributionStatistics.totalExtraMeals]);
//   summarySheet.addRow(['Total Meals Served', report.distributionStatistics.totalMealsServed]);
//   summarySheet.addRow(['']); // Empty row
  
//   summarySheet.addRow(['BENEFICIARY ACTIVITY']);
//   summarySheet.addRow(['Unique Beneficiaries', report.beneficiaryActivity.uniqueBeneficiariesServed]);
  
//   summarySheet.columns.forEach((column) => {
//     if (column) {
//       column.width = 25;
//     }
//   });

//   // === SHEET 2: Top Beneficiaries ===
//   const topBeneficiariesSheet = workbook.addWorksheet('Top Beneficiaries');
  
//   addHeaderRow(topBeneficiariesSheet, [
//     'Name',
//     'Phone',
//     'Times Served',
//     'Total Meals',
//   ]);

//   report.beneficiaryActivity.topBeneficiaries.forEach((ben) => {
//     topBeneficiariesSheet.addRow([
//       ben.fullName,
//       ben.phone,
//       ben.timesServed,
//       ben.totalMeals,
//     ]);
//   });

//   topBeneficiariesSheet.columns.forEach((column) => {
//     if (column) {
//       column.width = 18;
//     }
//   });

//   return workbook;
// };
// src/modules/exports/export.service.ts

import { createWorkbook, addHeaderRow } from '../../shared/utils/excel.util';
import { isValidDateFormat } from '../../shared/utils/dateHelpers';
import { AppError } from '../../shared/middleware/error.middleware';
import { prisma } from '../../shared/database/prisma';
import { MealType } from '@prisma/client';
import * as reportsService from '../reports/reports.service';

export const exportDonations = async (startDate?: string, endDate?: string) => {
  const where: any = {};

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      if (!isValidDateFormat(startDate)) throw new AppError('Invalid start date format', 400);
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      if (!isValidDateFormat(endDate)) throw new AppError('Invalid end date format', 400);
      where.date.lte = new Date(endDate);
    }
  }

  const donations = await prisma.donation.findMany({
    where,
    include: {
      donor: {
        select: {
          fullName: true,
          phone: true,
          location: { select: { name: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  const workbook = createWorkbook();
  const worksheet = workbook.addWorksheet('التبرعات', { views: [{ rightToLeft: true }] });

  addHeaderRow(worksheet, [
    'التاريخ', 'اسم المتبرع', 'الهاتف', 'المنطقة', 'المبلغ', 'طريقة الدفع', 'ملاحظات',
  ]);

  donations.forEach((d) => {
    worksheet.addRow([
      d.date.toISOString().split('T')[0],
      d.donor.fullName,
      d.donor.phone,
      d.donor.location.name,
      Number(d.amount),
      d.paymentMethod || '',
      d.notes || '',
    ]);
  });

  worksheet.columns.forEach((col) => { if (col) col.width = 18; });

  return workbook;
};

export const exportExpenses = async (startDate?: string, endDate?: string) => {
  const where: any = {};

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      if (!isValidDateFormat(startDate)) throw new AppError('Invalid start date format', 400);
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      if (!isValidDateFormat(endDate)) throw new AppError('Invalid end date format', 400);
      where.date.lte = new Date(endDate);
    }
  }

  const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } });

  const workbook = createWorkbook();
  const worksheet = workbook.addWorksheet('المصروفات', { views: [{ rightToLeft: true }] });

  addHeaderRow(worksheet, ['التاريخ', 'الاسم', 'الفئة', 'المبلغ', 'الوصف']);

  expenses.forEach((e) => {
    worksheet.addRow([
      e.date.toISOString().split('T')[0],
      e.name,
      e.category,
      Number(e.amount),
      e.description || '',
    ]);
  });

  worksheet.columns.forEach((col) => { if (col) col.width = 18; });

  return workbook;
};

export const exportDistribution = async (date: string) => {
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const targetDate = new Date(date);

  const distributionDay = await prisma.distributionDay.findUnique({
    where: { date: targetDate },
  });

  if (!distributionDay) {
    throw new AppError('Distribution day not found', 404);
  }

  const allocations = await prisma.distributionAllocation.findMany({
    where: { distributionDayId: distributionDay.id },
    include: {
      beneficiary: {
        include: { location: { select: { name: true } } },
      },
    },
    orderBy: [{ beneficiary: { fullName: 'asc' } }],
  });

  const workbook = createWorkbook();

  // ─── شيت المطبخ ──────────────────────────
  const kitchenSheet = workbook.addWorksheet('توزيع المطبخ', { views: [{ rightToLeft: true }] });
  addHeaderRow(kitchenSheet, [
    'اسم المستفيد', 'الاسم المختصر', 'الهاتف', 'المنطقة',
    'نوع الوجبة', 'الحد الأقصى للوجبات', 'استلم؟', 'الوجبات الموزعة', 'ملاحظات',
  ]);

  allocations
    .filter((a) => a.beneficiary.mealType === MealType.KITCHEN)
    .forEach((a) => {
      kitchenSheet.addRow([
        a.beneficiary.fullName,
        a.beneficiary.nickName || '',
        a.beneficiary.phone,
        a.beneficiary.location.name,
        'مطبخ',
        a.beneficiary.maxMealsPerDay,
        a.received ? 'نعم' : 'لا',
        a.mealsDelivered,
        a.notes || '',
      ]);
    });

  kitchenSheet.columns.forEach((col) => { if (col) col.width = 20; });

  // ─── شيت المنزلي ─────────────────────────────
  const homeSheet = workbook.addWorksheet('توزيع المنزل', { views: [{ rightToLeft: true }] });
  addHeaderRow(homeSheet, [
    'اسم المستفيد', 'الاسم المختصر', 'الهاتف', 'المنطقة',
    'نوع الوجبة', 'الوجبات الموزعة', 'ملاحظات',
  ]);

  allocations
    .filter((a) => a.beneficiary.mealType === MealType.HOME)
    .forEach((a) => {
      homeSheet.addRow([
        a.beneficiary.fullName,
        a.beneficiary.nickName || '',
        a.beneficiary.phone,
        a.beneficiary.location.name,
        'منزلي',
        a.mealsDelivered,
        a.notes || '',
      ]);
    });

  homeSheet.columns.forEach((col) => { if (col) col.width = 20; });

  return workbook;
};
export const exportDailyReport = async (date: string) => {
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const report = await reportsService.getDailyReport(date);
  const workbook = createWorkbook();

  // ─── Sheet 1: Summary ──────────────────────────
  const summarySheet = workbook.addWorksheet('ملخص التقرير');
  addHeaderRow(summarySheet, ['المعيار', 'القيمة']);

  summarySheet.addRow(['التاريخ', report.date]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['الجانب المالي']);
  summarySheet.addRow(['إجمالي التبرعات', report.financial.totalDonations]);
  summarySheet.addRow(['عدد التبرعات', report.financial.donationCount]);
  summarySheet.addRow(['إجمالي المصروفات', report.financial.totalExpenses]);
  summarySheet.addRow(['عدد المصروفات', report.financial.expenseCount]);
  summarySheet.addRow(['صافي الرصيد', report.financial.netBalance]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['وجبات المطبخ']);
  summarySheet.addRow(['الوجبات المخطط لها', report.kitchen.plannedMeals]);
  summarySheet.addRow(['الوجبات الموزعة', report.kitchen.deliveredMeals]);
  summarySheet.addRow(['عدد المستلمين', report.kitchen.deliveredCount]);
  summarySheet.addRow(['عدد الغائبين', report.kitchen.absentCount]);
  summarySheet.addRow(['الوجبات الإضافية', report.kitchen.extraMealsCount]);
  summarySheet.addRow(['إجمالي وجبات المطبخ', report.kitchen.totalMealsServed]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['وجبات البيوت']);
  summarySheet.addRow(['عدد التوزيعات', report.home.deliveredCount]);
  summarySheet.addRow(['إجمالي وجبات البيوت', report.home.deliveredMeals]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['الإجمالي الكلي']);
  summarySheet.addRow(['إجمالي المستفيدين', report.grandTotal.totalBeneficiariesServed]);
  summarySheet.addRow(['إجمالي الوجبات المقدمة', report.grandTotal.totalMealsServed]);

  summarySheet.columns.forEach((col) => { if (col) col.width = 25; });

  // ─── Sheet 2: Donations ────────────────────────
  const donations = await prisma.donation.findMany({
    where: { date: new Date(date) },
    include: {
      donor: { select: { fullName: true, phone: true, location: { select: { name: true } } } },
    },
    orderBy: { date: 'desc' },
  });

  const donationSheet = workbook.addWorksheet('التبرعات');
  addHeaderRow(donationSheet, ['التاريخ', 'اسم المتبرع', 'الهاتف', 'الموقع', 'المبلغ', 'طريقة الدفع', 'ملاحظات']);

  donations.forEach((d) => {
    donationSheet.addRow([
      d.date.toISOString().split('T')[0],
      d.donor.fullName,
      d.donor.phone,
      d.donor.location.name,
      Number(d.amount),
      d.paymentMethod || '',
      d.notes || '',
    ]);
  });

  donationSheet.columns.forEach((col) => { if (col) col.width = 18; });

  // ─── Sheet 3: Expenses ─────────────────────────
  const expenses = await prisma.expense.findMany({
    where: { date: new Date(date) },
    orderBy: { date: 'desc' },
  });

  const expenseSheet = workbook.addWorksheet('المصروفات');
  addHeaderRow(expenseSheet, ['التاريخ', 'الاسم', 'الفئة', 'المبلغ', 'الوصف']);

  expenses.forEach((e) => {
    expenseSheet.addRow([
      e.date.toISOString().split('T')[0],
      e.name,
      e.category,
      Number(e.amount),
      e.description || '',
    ]);
  });

  expenseSheet.columns.forEach((col) => { if (col) col.width = 18; });

  // ─── Sheet 4: Kitchen Distribution ────────────
  const distributionDay = await prisma.distributionDay.findUnique({
    where: { date: new Date(date) },
  });

  if (distributionDay) {
    const allocations = await prisma.distributionAllocation.findMany({
      where: { distributionDayId: distributionDay.id },
      include: { beneficiary: { include: { location: { select: { name: true } } } } },
      orderBy: [{ beneficiary: { fullName: 'asc' } }],
    });

    const kitchenSheet = workbook.addWorksheet('توزيع المطبخ');
    addHeaderRow(kitchenSheet, [
      'اسم المستفيد', 'اسم الشهرة', 'الهاتف', 'الموقع',
      'أقصى وجبات/اليوم', 'استلم', 'عدد الوجبات الموزعة', 'ملاحظات',
    ]);

    allocations
      .filter((a) => a.beneficiary.mealType === MealType.KITCHEN)
      .forEach((a) => {
        kitchenSheet.addRow([
          a.beneficiary.fullName,
          a.beneficiary.nickName || '',
          a.beneficiary.phone,
          a.beneficiary.location.name,
          a.beneficiary.maxMealsPerDay,
          a.received ? 'نعم' : 'لا',
          a.mealsDelivered,
          a.notes || '',
        ]);
      });

    kitchenSheet.columns.forEach((col) => { if (col) col.width = 20; });

    // ─── Sheet 5: Home Distribution ───────────────
    const homeSheet = workbook.addWorksheet('توزيع البيوت');
    addHeaderRow(homeSheet, [
      'اسم المستفيد', 'اسم الشهرة', 'الهاتف', 'الموقع', 'عدد الوجبات الموزعة', 'ملاحظات',
    ]);

    allocations
      .filter((a) => a.beneficiary.mealType === MealType.HOME)
      .forEach((a) => {
        homeSheet.addRow([
          a.beneficiary.fullName,
          a.beneficiary.nickName || '',
          a.beneficiary.phone,
          a.beneficiary.location.name,
          a.mealsDelivered,
          a.notes || '',
        ]);
      });

    homeSheet.columns.forEach((col) => { if (col) col.width = 20; });
  }

  return workbook;
};

export const exportPeriodReport = async (startDate: string, endDate: string) => {
  const report = await reportsService.getPeriodReport(startDate, endDate);

  const workbook = createWorkbook(); 

  // ── شيت الملخص ─────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('الملخص', { views: [{ rightToLeft: true }] });
  addHeaderRow(summarySheet, ['البيان', 'القيمة']);

  summarySheet.addRow(['بداية الفترة', report.period.startDate]);
  summarySheet.addRow(['نهاية الفترة', report.period.endDate]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['الملخص المالي']);
  summarySheet.addRow(['إجمالي التبرعات', report.financialSummary.totalDonations]);
  summarySheet.addRow(['عدد التبرعات', report.financialSummary.donationCount]);
  summarySheet.addRow(['إجمالي المصروفات', report.financialSummary.totalExpenses]);
  summarySheet.addRow(['عدد المصروفات', report.financialSummary.expenseCount]);
  summarySheet.addRow(['الرصيد المتبقي', report.financialSummary.remainingBalance]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['وجبات المطبخ']);
  summarySheet.addRow(['إجمالي التخصيصات', report.kitchen.totalAllocations]);
  summarySheet.addRow(['عدد المستلمين', report.kitchen.totalDeliveredCount]);
  summarySheet.addRow(['الوجبات المخططة', report.kitchen.totalPlannedMeals]);
  summarySheet.addRow(['الوجبات الموزعة', report.kitchen.totalDeliveredMeals]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['وجبات إضافية']);
  summarySheet.addRow(['عدد التوزيعات الإضافية', report.extra.count]);
  summarySheet.addRow(['إجمالي الوجبات الإضافية', report.extra.totalMeals]);
  summarySheet.addRow(['']);

  summarySheet.addRow(['الإجمالي الكلي']);
  summarySheet.addRow(['إجمالي الوجبات الموزعة', report.grandTotal.totalMealsServed]);

  summarySheet.columns.forEach((col) => { if (col) col.width = 28; });

  // ── شيت توزيع المطبخ (Top Beneficiaries) ───────────────────
  const kitchenSheet = workbook.addWorksheet('مستفيدو المطبخ', { views: [{ rightToLeft: true }] });
  addHeaderRow(kitchenSheet, ['الاسم', 'الهاتف', 'عدد مرات التوزيع', 'إجمالي الوجبات']);

  report.beneficiaryActivity.topBeneficiaries
    .filter((b: any) => b.mealType === 'KITCHEN' || !b.mealType) // kitchen فقط
    .forEach((b: any) => {
      kitchenSheet.addRow([b.fullName, b.phone, b.timesServed, b.totalMeals]);
    });

  kitchenSheet.columns.forEach((col) => { if (col) col.width = 22; });

  // ── شيت المنزلي ─────────────────────────────────────────────
  const homeSheet = workbook.addWorksheet('المستفيدون المنزليون', { views: [{ rightToLeft: true }] });
  addHeaderRow(homeSheet, ['الاسم', 'الهاتف', 'عدد مرات التوزيع', 'إجمالي الوجبات']);

  report.beneficiaryActivity.topBeneficiaries
    .filter((b: any) => b.mealType === 'HOME')
    .forEach((b: any) => {
      homeSheet.addRow([b.fullName, b.phone, b.timesServed, b.totalMeals]);
    });

  // إجمالي المنزلي في الأسفل
  homeSheet.addRow(['']);
  homeSheet.addRow(['إجمالي التوصيلات', report.home.totalDeliveries]);
  homeSheet.addRow(['إجمالي الوجبات المنزلية', report.home.totalDeliveredMeals]);

  homeSheet.columns.forEach((col) => { if (col) col.width = 22; });

  return workbook;
};