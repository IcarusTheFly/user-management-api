import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

const fastifyErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
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
