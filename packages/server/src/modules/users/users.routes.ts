import { FastifyInstance } from "fastify";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserController,
  updateUserController,
} from "./users.controllers";
import {
  userResponseSchema,
  allUsersResponseSchema,
  userCreateSchema,
  userUpdateSchema,
} from "./users.schemas";

export const userRoutes = async (server: FastifyInstance) => {
  server.get("/", allUsersResponseSchema, getAllUsersController);

  server.post("/", userCreateSchema, createUserController);

  server.get("/:id", userResponseSchema, getUserController);

  server.put("/:id", userUpdateSchema, updateUserController);

  server.delete("/:id", userResponseSchema, deleteUserController);
};
