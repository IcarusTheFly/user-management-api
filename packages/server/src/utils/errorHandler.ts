import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

const fastifyErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error.validation) {
    request.log.error("Validation error");
    return reply.status(400).send({
      data: null,
      errors: [
        {
          message: "Validation error: " + error.message,
        },
      ],
    });
  }

  request.log.error(error);
  return reply.status(500).send({
    data: null,
    errors: [
      {
        message: `An unexpected error occurred: ${error}`,
      },
    ],
  });
};

export default fastifyErrorHandler;
