import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../../utils/passwordHandler";

const prisma = new PrismaClient();

export const getAllUsers = async (limit: number, skip: number) => {
  const users = await prisma.user.findMany({
    skip,
    take: limit,
  });

  return users;
};

export const getUser = async (id: number) => {
  return prisma.user.findUnique({
    where: { id: id },
  });
};

export const authenticateUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingUser === null) {
    return null;
  }

  const correctPassword = verifyPassword(
    password,
    existingUser.password,
    existingUser.salt
  );
  if (!correctPassword) {
    return null;
  }

  return existingUser;
};
