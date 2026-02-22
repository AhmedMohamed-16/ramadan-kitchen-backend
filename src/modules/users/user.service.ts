import { prisma } from '../../shared/database/prisma';
import { hashPassword } from '../../shared/utils/password.util';
import { AppError } from '../../shared/middleware/error.middleware';
import { UserRole } from '@prisma/client';

interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

interface UpdateUserInput {
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const createUser = async (input: CreateUserInput) => {
  const { email, password, fullName, role } = input;

  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
};

export const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Update user
  const user = await prisma.user.update({
    where: { id },
    data: input,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return user;
};

export const deleteUser = async (id: string) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Soft delete by setting isActive to false
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: 'User deactivated successfully' };
};