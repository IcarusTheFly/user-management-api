import { PrismaClient } from "@prisma/client";

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

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: email },
  });
};

export const createUser = async (
  email: string,
  password: string,
  name?: string,
  isAdmin: boolean = false
) => {
  return prisma.user.create({
    data: {
      email,
      password,
      name,
      isAdmin,
      createdAt: new Date(),
    },
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({
    where: { id: id },
  });
};

export const constructPaginationUrls = (
  baseUrl: string,
  limit: number,
  skip: number,
  userCount: number
) => {
  const nextSkip = userCount === limit ? skip + limit : null;
  const prevSkip = skip - limit >= 0 ? skip - limit : null;

  const nextUrl =
    nextSkip !== null ? `${baseUrl}?limit=${limit}&skip=${nextSkip}` : null;
  const prevUrl =
    prevSkip !== null ? `${baseUrl}?&limit=${limit}&skip=${prevSkip}` : null;

  return { nextUrl, prevUrl };
};
