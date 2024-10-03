import { PrismaClient } from "@prisma/client";
import { UserUpdateProps } from "./users.types";
import { encryptPassword } from "../../utils/passwordHandler";

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

export const emailUsedByAnotherUser = async (email: string, id: number) => {
  const anotherUser = await prisma.user.findFirst({
    where: {
      email: email,
      NOT: { id: id },
    },
  });

  if (anotherUser) {
    return true;
  }

  return false;
};

export const createUser = async (
  email: string,
  password: string,
  name?: string,
  isAdmin: boolean = false
) => {
  const { hash, salt } = encryptPassword(password);

  return prisma.user.create({
    data: {
      email,
      name,
      isAdmin,
      password: hash,
      salt: salt,
      createdAt: new Date(),
    },
  });
};

export const updateUser = async (
  id: number,
  email?: string,
  password?: string,
  name?: string,
  isAdmin: boolean = false
) => {
  const updateData: UserUpdateProps = {};

  if (email !== undefined) {
    updateData.email = email;
  }
  if (password !== undefined) {
    updateData.password = password;
  }
  if (name !== undefined) {
    updateData.name = name;
  }
  if (isAdmin !== undefined) {
    updateData.isAdmin = isAdmin;
  }

  return prisma.user.update({
    where: { id: id },
    data: updateData,
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
