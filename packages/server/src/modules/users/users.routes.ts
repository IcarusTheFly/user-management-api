import { FastifyInstance } from "fastify";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserController,
} from "./users.controllers";
import {
  userResponseSchema,
  allUsersResponseSchema,
  userCreateSchema,
} from "./users.schemas";

export const userRoutes = async (server: FastifyInstance) => {
  server.get("/", allUsersResponseSchema, getAllUsersController);

  server.get("/:id", userResponseSchema, getUserController);

  server.post("/", userCreateSchema, createUserController);

  server.delete("/:id", userResponseSchema, deleteUserController);
};
