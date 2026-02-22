import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination.util';
import { PaymentMethod } from '@prisma/client';

interface CreateDonationInput {
  donorId: string;
  amount: number;
  date: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

interface GetDonationsParams {
  page?: number;
  limit?: number;
  donorId?: string;
  startDate?: string;
  endDate?: string;
}

export const createDonation = async (input: CreateDonationInput) => {
  // Verify donor exists
  const donor = await prisma.donor.findUnique({
    where: { id: input.donorId },
  });

  if (!donor) {
    throw new AppError('Donor not found', 404);
  }

  return await prisma.donation.create({
    data: {
      ...input,
      date: new Date(input.date),
    },
    include: {
      donor: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
  });
};

export const getDonations = async (params: GetDonationsParams) => {
  const { skip, take, page, limit } = getPagination(params);

  // Build where clause
  const where: any = {};

  if (params.donorId) {
    where.donorId = params.donorId;
  }

  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.date.lte = new Date(params.endDate);
    }
  }

  // Get total count
  const total = await prisma.donation.count({ where });

  // Get donations
  const donations = await prisma.donation.findMany({
    where,
    skip,
    take,
    include: {
      donor: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return {
    data: donations,
    meta: getPaginationMeta(total, page, limit),
  };
};

export const getDonationById = async (id: string) => {
  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      donor: {
        include: {
          location: true,
        },
      },
    },
  });

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  return donation;
};

export const deleteDonation = async (id: string) => {
  // Check if donation exists
  const existing = await prisma.donation.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Donation not found', 404);
  }

  await prisma.donation.delete({
    where: { id },
  });

  return { message: 'Donation deleted successfully' };
};