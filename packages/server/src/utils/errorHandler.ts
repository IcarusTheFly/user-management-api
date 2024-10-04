import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { isErrorWithStatusType } from "./typeChecks";

const fastifyErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (isErrorWithStatusType(error)) {
    request.log.error(error.message);
    return reply.status(error.statusCode).send({
      data: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }

  if (error.validation) {
    const errorMessage = "Validation error: " + error.message;
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

  const errorMessage = `An unexpected error occurred: ${error}`;
  request.log.error(errorMessage);
  return reply.status(500).send({
    data: null,
    errors: [
      {
        message: errorMessage,
      },
    ],
  });
};

export default fastifyErrorHandler;
