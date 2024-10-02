import { serverConfig } from "../../config";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  constructPaginationUrls,
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  getUserByEmail,
} from "./users.services";
import { validateCreateUser } from "./users.validators";

export async function getAllUsersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const defaultLimit = serverConfig.pagination.defaultLimit;
  const defaultSkip = serverConfig.pagination.defaultSkip;

  const { limit = defaultLimit, skip = defaultSkip } = request.query as {
    limit?: number;
    skip?: number;
  };

  try {
    const users = await getAllUsers(Number(limit), Number(skip));
    const baseUrl = `${request.protocol}://${request.hostname}:${
      request.port
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
    console.error(error);
    reply.status(500).send({
      data: null,
      meta: null,
      errors: [
        {
          message: "An unexpected error occurred while retrieving users",
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
  try {
    const user = await getUser(Number(id));
    if (user === null) {
      return reply.status(404).send({
        data: null,
        errors: [
          {
            message: `User with id (${id}) not found`,
          },
        ],
      });
    }
    reply.send({
      data: user,
      errors: null,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({
      data: null,
      errors: [
        {
          message: `An unexpected error occurred while retrieving user with id: ${id}`,
        },
      ],
    });
  }
}

export async function createUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password, name, isAdmin } = request.body as {
    email: string;
    password: string;
    name?: string;
    isAdmin?: boolean;
  };

  // Fastify schemas already validate data types and format
  // For scalable and maintainable code, we might as well
  // create our own validations. Hence, implementing something basic
  const validationErrors = validateCreateUser(email, password);
  if (validationErrors.length > 0) {
    return reply.status(400).send({
      data: null,
      errors: validationErrors,
    });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return reply.status(400).send({
        data: null,
        errors: [
          {
            message: `A user with the email address (${email}) already exists`,
          },
        ],
      });
    }

    const user = await createUser(email, password, name, isAdmin);
    reply.status(201).send({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      errors: null,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({
      errors: [
        {
          message: `An unexpected error occurred while creating user: ${error}`,
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
  try {
    const user = await getUser(Number(id));
    if (user === null) {
      return reply.status(404).send({
        data: null,
        errors: [
          {
            message: `User with id (${id}) not found`,
          },
        ],
      });
    }
    await deleteUser(Number(id));
    reply.status(204).send({});
  } catch (error) {
    console.error(error);
    reply.status(500).send({
      data: null,
      errors: [
        {
          message: `An unexpected error occurred while deleting user with id: ${id}`,
        },
      ],
    });
  }
}
