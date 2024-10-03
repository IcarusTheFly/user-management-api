import { FastifyRequest, FastifyReply } from "fastify";
import { UserType } from "../modules/users/users.types";
export const controlRoleBasedAccess = (onlyAdminAccess = true) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as UserType;

    if (!user) {
      reply.status(401).send({
        data: null,
        errors: [
          {
            message:
              "Unauthorized: You must be logged in to perform this action",
          },
        ],
      });
      return;
    }

    if (onlyAdminAccess && !user.isAdmin) {
      reply.status(403).send({
        data: null,
        errors: [
          {
            message:
              "Unauthorized: You do not have permissions to perform this action",
          },
        ],
      });
      return;
    }

    return;
  };
};
