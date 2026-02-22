import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination.util';

interface CreateDonorInput {
  fullName: string;
  phone: string;
  locationId: string;
  notes?: string;
}

interface UpdateDonorInput {
  fullName?: string;
  phone?: string;
  locationId?: string;
  notes?: string;
}

interface GetDonorsParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
}

export const createDonor = async (input: CreateDonorInput) => {
  // Verify location exists
  const location = await prisma.location.findUnique({
    where: { id: input.locationId },
  });

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  return await prisma.donor.create({
    data: input,
    include: {
      location: true,
    },
  });
};

export const getDonors = async (params: GetDonorsParams) => {
  const { skip, take, page, limit } = getPagination(params);

  // Build where clause
  const where: any = {};

  if (params.search) {
    where.OR = [
      { fullName: { contains: params.search, mode: 'insensitive' } },
      { phone: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params.locationId) {
    where.locationId = params.locationId;
  }

  // Get total count
  const total = await prisma.donor.count({ where });

  // Get donors
  const donors = await prisma.donor.findMany({
    where,
    skip,
    take,
    include: {
      location: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    data: donors,
    meta: getPaginationMeta(total, page, limit),
  };
};

export const getDonorById = async (id: string) => {
  const donor = await prisma.donor.findUnique({
    where: { id },
    include: {
      location: true,
      donations: {
        orderBy: { date: 'desc' },
        take: 10, // Last 10 donations
      },
    },
  });

  if (!donor) {
    throw new AppError('Donor not found', 404);
  }

  return donor;
};

export const updateDonor = async (id: string, input: UpdateDonorInput) => {
  // Check if donor exists
  const existing = await prisma.donor.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Donor not found', 404);
  }

  // If updating location, verify it exists
  if (input.locationId) {
    const location = await prisma.location.findUnique({
      where: { id: input.locationId },
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }
  }

  return await prisma.donor.update({
    where: { id },
    data: input,
    include: {
      location: true,
    },
  });
};

export const deleteDonor = async (id: string) => {
  // Check if donor exists
  const existing = await prisma.donor.findUnique({
    where: { id },
    include: {
      donations: true,
    },
  });

  if (!existing) {
    throw new AppError('Donor not found', 404);
  }

  // Check if donor has donations
  if (existing.donations.length > 0) {
    throw new AppError('Cannot delete donor with existing donations', 400);
  }

  await prisma.donor.delete({
    where: { id },
  });

  return { message: 'Donor deleted successfully' };
};