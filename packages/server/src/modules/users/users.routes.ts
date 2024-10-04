import { FastifyInstance } from "fastify";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserController,
  updateUserController,
  uploadUserAvatarController,
} from "./users.controllers";
import {
  userResponseSchema,
  allUsersResponseSchema,
  userCreateSchema,
  userUpdateSchema,
  userUploadAvatarSchema,
} from "./users.schemas";
import { controlRoleBasedAccess } from "../../middleware/controlRoleBasedAccess";

export const userRoutes = async (server: FastifyInstance) => {
  server.get(
    "/",
    {
      preValidation: [controlRoleBasedAccess(false)],
      ...allUsersResponseSchema,
    },
    getAllUsersController
  );

  server.post(
    "/",
    {
      preValidation: [controlRoleBasedAccess(true)],
      ...userCreateSchema,
    },
    createUserController
  );

  server.post(
    "/:id/upload-avatar",
    {
      preValidation: [controlRoleBasedAccess(true)],
      ...userUploadAvatarSchema,
    },
    uploadUserAvatarController
  );

  server.get(
    "/:id",
    {
      preValidation: [controlRoleBasedAccess(false)],
      ...userResponseSchema,
    },
    getUserController
  );

  server.put(
    "/:id",
    {
      preValidation: [controlRoleBasedAccess(true)],
      ...userUpdateSchema,
    },
    updateUserController
  );

  server.delete(
    "/:id",
    {
      preValidation: [controlRoleBasedAccess(true)],
      ...userResponseSchema,
    },
    deleteUserController
  );
};
