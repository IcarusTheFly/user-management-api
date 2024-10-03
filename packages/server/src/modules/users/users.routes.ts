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
import { controlRoleBasedAccess } from "../../middleware/controlRoleBasedAccess";

export const userRoutes = async (server: FastifyInstance) => {
  server.get(
    "/",
    {
      preValidation: [server.authenticate, controlRoleBasedAccess(false)],
      ...allUsersResponseSchema,
    },
    getAllUsersController
  );

  server.post(
    "/",
    {
      preValidation: [server.authenticate, controlRoleBasedAccess(true)],
      ...userCreateSchema,
    },
    createUserController
  );

  server.get(
    "/:id",
    {
      preValidation: [server.authenticate, controlRoleBasedAccess(false)],
      ...userResponseSchema,
    },
    getUserController
  );

  server.put(
    "/:id",
    {
      preValidation: [server.authenticate, controlRoleBasedAccess(true)],
      ...userUpdateSchema,
    },
    updateUserController
  );

  server.delete(
    "/:id",
    {
      preValidation: [server.authenticate, controlRoleBasedAccess(true)],
      ...userResponseSchema,
    },
    deleteUserController
  );
};
