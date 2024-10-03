import { FastifyRequest, FastifyReply } from "fastify";
import { UserType } from "../modules/users/users.types";
import { isErrorWithStatusType } from "../utils/typeChecks";

export const controlRoleBasedAccess = (onlyAdminAccess = true) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user: UserType = await request.jwtVerify();

      if (!user) {
        const errorMessage =
          "Unauthorized: You must be logged in to perform this action";
        request.log.error(errorMessage);
        return reply.status(401).send({
          data: null,
          errors: [
            {
              message: errorMessage,
            },
          ],
        });
      }

      if (onlyAdminAccess && !user.isAdmin) {
        const errorMessage =
          "Unauthorized: You do not have permissions to perform this action";
        request.log.error(errorMessage);
        return reply.status(403).send({
          data: null,
          errors: [
            {
              message: errorMessage,
            },
          ],
        });
      }

      request.log.info("Authentication successful");
    } catch (error) {
      const statusCode = isErrorWithStatusType(error) ? error.statusCode : 500;
      const errorMessage = isErrorWithStatusType(error)
        ? error.message
        : `An unexpected error occurred during authentication: ${error}`;
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
  };
};
