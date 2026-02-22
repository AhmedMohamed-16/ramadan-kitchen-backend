import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

interface CreateLocationInput {
  name: string;
  description?: string;
}

interface UpdateLocationInput {
  name?: string;
  description?: string;
}

export const createLocation = async (input: CreateLocationInput) => {
  return await prisma.location.create({
    data: input,
  });
};

export const getLocations = async () => {
  return await prisma.location.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getLocationById = async (id: string) => {
  const location = await prisma.location.findUnique({
    where: { id },
  });

  if (!location) {
    throw new AppError('Location not found', 404);
  }

  return location;
};

export const updateLocation = async (id: string, input: UpdateLocationInput) => {
  // Check if exists
  const existing = await prisma.location.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Location not found', 404);
  }

  return await prisma.location.update({
    where: { id },
    data: input,
  });
};

export const deleteLocation = async (id: string) => {
  // Check if exists
  const existing = await prisma.location.findUnique({
    where: { id },
    include: {
      donors: true,
      beneficiaries: true,
    },
  });

  if (!existing) {
    throw new AppError('Location not found', 404);
  }

  // Check if location is referenced
  if (existing.donors.length > 0 || existing.beneficiaries.length > 0) {
    throw new AppError('Cannot delete location with existing donors or beneficiaries', 400);
  }

  await prisma.location.delete({
    where: { id },
  });

  return { message: 'Location deleted successfully' };
};