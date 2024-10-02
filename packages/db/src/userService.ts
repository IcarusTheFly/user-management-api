import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = async () => {
  return prisma.user.findMany();
};

export const getUser = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const createUser = async (
  email: string,
  password: string,
  name?: string,
  isAdmin: boolean = false
) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  return prisma.user.create(
    {
      data: {
        email,
        password,
        name,
        isAdmin,
        createdAt: new Date(),
      },
    }
  );
};

export const updateUser = async (
  id: number,
  data: { email?: string; name?: string }
) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({
    where: { id },
  });
};
