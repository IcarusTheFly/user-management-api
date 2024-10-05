import { paginationOptions } from "../../config";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  constructPaginationUrls,
  createUser,
  deleteUser,
  emailUsedByAnotherUser,
  getAllUsers,
  getUser,
  getUserByEmail,
  updateUser,
  uploadAvatar,
} from "./users.services";
import {
  validateCreateUser,
  validateDeleteUser,
  validateGetUser,
  validateUpdateUser,
  validateUserAvatarFile,
} from "./users.validators";
import { UserCreateBody, UserUpdateBody } from "./users.types";
import { broadcastNotification } from "@user-management-api/real-time-notifications";
import { isErrorWithStatusType } from "../../utils/typeChecks";

export async function getAllUsersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const defaultLimit = paginationOptions.defaultLimit;
  const defaultSkip = paginationOptions.defaultSkip;

  const { limit = defaultLimit, skip = defaultSkip } = request.query as {
    limit?: number;
    skip?: number;
  };

  try {
    const users = await getAllUsers(Number(limit), Number(skip));
    const baseUrl = `${request.protocol}://${request.hostname}${
      request.port ? `:${request.port}` : ""
    }${request.url.split("?").shift()}`;
    const { nextUrl, prevUrl } = constructPaginationUrls(
      baseUrl,
      Number(limit),
      Number(skip),
      users.length
    );

    reply.send({
      data: users,
      errors: null,
      meta: {
        limit: Number(limit),
        skip: Number(skip),
        next: nextUrl,
        previous: prevUrl,
      },
    });
  } catch (error) {
    const statusCode = isErrorWithStatusType(error) ? error.statusCode : 500;
    const errorMessage = isErrorWithStatusType(error)
      ? error.message
      : `An unexpected error occurred while retrieving users (${error})`;

    request.log.error(errorMessage);
    return reply.status(statusCode).send({
      data: null,
      meta: null,
      errors: [
        {
          message: errorMessage,
        },
      ],
    });
  }
}

export async function getUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const validationErrors = validateGetUser(id);
  if (validationErrors.length > 0) {
    request.log.error("Validation error");
    return reply.status(400).send({
      data: null,
      errors: validationErrors,
    });
  }

  const numericId = Number(id);
  try {
    const user = await getUser(numericId);
    if (user === null) {
      const errorMessage = `User with id (${numericId}) not found`;
      request.log.error(errorMessage);
      return reply.status(404).send({
        data: null,
        errors: [
          {
            message: errorMessage,
          },
        ],
      });
    }
    reply.send({
      data: user,
      errors: null,
    });
  } catch (error) {
    const statusCode = isErrorWithStatusType(error) ? error.statusCode : 500;
    const errorMessage = isErrorWithStatusType(error)
      ? error.message
      : `An unexpected error occurred while retrieving user with id: ${numericId} (${error})`;

    request.log.error(errorMessage);
    return reply.status(statusCode).send({
      data: null,
      errors: [
        {
          message: errorMessage,
        },
      ],
    });
  }
}

export async function createUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password, name, isAdmin } = request.body as UserCreateBody;

  // Fastify schemas already validate data types and format
  // For scalable and maintainable code, we might as well
  // create our own validations. Hence, implementing something basic
  const validationErrors = validateCreateUser(email, password);
  if (validationErrors.length > 0) {
    request.log.error("Validation error");
    return reply.status(400).send({
      data: null,
      errors: validationErrors,
    });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      const errorMessage = `A user with the email address (${email}) already exists`;
      request.log.error(errorMessage);
      return reply.status(400).send({
        data: null,
        errors: [
          {
            message: errorMessage,
          },
        ],
      });
    }

    const user = await createUser(email, password, name, isAdmin);
    const createdData = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
    broadcastNotification(
      `[User: ${user.id}] :: User created with data: ${JSON.stringify(
        createdData
      )}`
    );
    return reply.status(201).send({
      data: createdData,
      errors: null,
    });
  } catch (error) {
    const statusCode = isErrorWithStatusType(error) ? error.statusCode : 500;
    const errorMessage = isErrorWithStatusType(error)
      ? error.message
      : `An unexpected error occurred while creating user (${error})`;

    request.log.error(errorMessage);
    return reply.status(statusCode).send({
      data: null,
      errors: [
        {
          message: errorMessage,
        },
      ],
    });
  }
}

export async function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const { email, password, name, isAdmin } = request.body as UserUpdateBody;

  const validationErrors = validateUpdateUser(
    id,
    email,
    password,
    name,
    isAdmin
  );
  if (validationErrors.length > 0) {
    request.log.error("Validation error");
    return reply.status(400).send({
      data: null,
      errors: validationErrors,
    });
  }

  const numericId = Number(id);
  try {
    const existingUser = await getUser(numericId);
    if (existingUser === null) {
      const errorMessage = `User with id (${numericId}) not found`;
      request.log.error(errorMessage);
      return reply.status(404).send({
        data: null,
        errors: [
          {
            message: errorMessage,
          },
        ],
      });
    }

    if (email) {
      const newEmailAlreadyInUse = await emailUsedByAnotherUser(
        email,
        numericId
      );
      if (newEmailAlreadyInUse) {
        const errorMessage = `This email address (${email}) is being used by another user`;
        request.log.error(errorMessage);
        return reply.status(400).send({
          data: null,
          errors: [
            {
              message: errorMessage,
            },
          ],
        });
      }
    }

    const user = await updateUser(numericId, email, password, name, isAdmin);
    const updatedData = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
    broadcastNotification(
      `[User: ${id}] :: User updated with data: ${JSON.stringify(updatedData)}`
    );
    return reply.status(200).send({
      data: updatedData,
      errors: null,
    });
  } catch (error) {
    const statusCode = isErrorWithStatusType(error) ? error.statusCode : 500;
    const errorMessage = isErrorWithStatusType(error)
      ? error.message
      : `An unexpected error occurred while updating user (${error})`;

    request.log.error(errorMessage);
    return reply.status(statusCode).send({
      data: null,
      errors: [
        {
          message: errorMessage,
        },
      ],
    });
  }
}

export async function deleteUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const validationErrors = validateDeleteUser(id);
  if (validationErrors.length > 0) {
    request.log.error("Validation error");
    return reply.status(400).send({
      data: null,
      errors: validationErrors,
    });
  }

  const numericId = Number(id);
  try {
    const existingUser = await getUser(numericId);
    if (existingUser === null) {
      const errorMessage = `User with id (${numericId}) not found`;
      request.log.error(errorMessage);
      return reply.status(404).send({
        data: null,
        errors: [
          {
            message: errorMessage,
          },
        ],
      });
    }
    await deleteUser(numericId);
    broadcastNotification(`[User: ${id}] :: User deleted`);
    return reply.status(204).send({});
  } catch (error) {
    const statusCode = isErrorWithStatusType(error) ? error.statusCode : 500;
    const errorMessage = isErrorWithStatusType(error)
      ? error.message
      : `An unexpected error occurred while deleting user with id: ${numericId} (${error})`;

    request.log.error(errorMessage);
    return reply.status(statusCode).send({
      data: null,
      errors: [
        {
          message: errorMessage,
        },
      ],
    });
  }
}

export async function uploadUserAvatarController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const parts = request.parts();

  for await (const part of parts) {
    if (part.type === "file") {
      const validationErrors = validateUserAvatarFile(part);
      if (validationErrors.length > 0) {
        request.log.error("Validation error");
        return reply.status(400).send({
          data: null,
          errors: validationErrors,
        });
      }

      try {
        const fileName = `${id}-${Date.now()}-${part.filename}`;
        await uploadAvatar(part, fileName, Number(id));
        const successMessage = `Avatar successfully uploaded (${fileName})`;
        request.log.info(`Avatar successfully uploaded (${fileName})`);
        broadcastNotification(`[User: ${id}] :: ${successMessage}`);
        return reply.status(201).send({
          data: {
            avatarFileName: fileName,
          },
          errors: null,
        });
      } catch (error) {
        const statusCode = isErrorWithStatusType(error)
          ? error.statusCode
          : 500;
        const errorMessage = isErrorWithStatusType(error)
          ? error.message
          : `An unexpected error occurred while uploading user avatar (${error})`;

        request.log.error(errorMessage);
        return reply.status(statusCode).send({
          data: null,
          errors: [
            {
              message: errorMessage,
            },
          ],
        });
      }
    } else {
      const errorMessage = "A file must be selected";
      request.log.error(errorMessage);
      return reply.status(400).send({
        data: null,
        errors: [
          {
            message: errorMessage,
          },
        ],
      });
    }
  }
}
