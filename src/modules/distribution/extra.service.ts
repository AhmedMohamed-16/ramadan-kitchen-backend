import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { isValidDateFormat } from '../../shared/utils/dateHelpers';

interface CreateExtraDistributionInput {
  beneficiaryId: string;
  mealsGiven: number;
  notes?: string;
}

interface CreateBeneficiaryData {
  fullName: string;
  phone: string;
  numberOfChildren?: number;
  maxMealsPerDay?: number;
  locationId: string;
}

interface CreateExtraWithNewBeneficiaryInput {
  beneficiary: CreateBeneficiaryData;
  mealsGiven: number;
  notes?: string;
}

export const createExtraDistribution = async (
  date: string,
  input: CreateExtraDistributionInput
) => {
  // Validate date format
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  // Verify beneficiary exists
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: input.beneficiaryId },
  });

  if (!beneficiary) {
    throw new AppError('Beneficiary not found', 404);
  }

  // Verify distribution day exists
  const distributionDay = await prisma.distributionDay.findUnique({
    where: { date: new Date(date) },
  });

  if (!distributionDay) {
    throw new AppError(
      'Distribution day not found. Initialize it first.',
      404
    );
  }

  // Create extra distribution
  const extraDistribution = await prisma.extraDistribution.create({
    data: {
      beneficiaryId: input.beneficiaryId,
      fullName: beneficiary.fullName,
      phone: beneficiary.phone,
      mealsGiven: input.mealsGiven,
      date: new Date(date),
      notes: input.notes,
    },
    include: {
      beneficiary: {
        include: {
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return extraDistribution;
};

export const createExtraWithNewBeneficiary = async (
  date: string,
  input: CreateExtraWithNewBeneficiaryInput
) => {
  // Validate date format
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  // Verify location exists
  const location = await prisma.location.findUnique({
    where: { id: input.beneficiary.locationId },
  });

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  // Verify distribution day exists
  const distributionDay = await prisma.distributionDay.findUnique({
    where: { date: new Date(date) },
  });

  if (!distributionDay) {
    throw new AppError(
      'Distribution day not found. Initialize it first.',
      404
    );
  }

  // Create beneficiary and extra distribution in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create beneficiary
    const newBeneficiary = await tx.beneficiary.create({
      data: input.beneficiary,
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create extra distribution
    const extraDistribution = await tx.extraDistribution.create({
      data: {
        beneficiaryId: newBeneficiary.id,
        fullName: newBeneficiary.fullName,
        phone: newBeneficiary.phone,
        mealsGiven: input.mealsGiven,
        date: new Date(date),
        notes: input.notes,
      },
      include: {
        beneficiary: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      beneficiary: newBeneficiary,
      extraDistribution,
    };
  });

  return result;
};

export const getExtraDistributions = async (date: string) => {
  // Validate date format
  if (!isValidDateFormat(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  // Get extra distributions for the date
  const extraDistributions = await prisma.extraDistribution.findMany({
    where: {
      date: new Date(date),
    },
    include: {
      beneficiary: {
        include: {
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate total extra meals
  const totalExtraMeals = extraDistributions.reduce(
    (sum, extra) => sum + extra.mealsGiven,
    0
  );

  return {
    extraDistributions,
    totalExtraMeals,
    count: extraDistributions.length,
  };
};