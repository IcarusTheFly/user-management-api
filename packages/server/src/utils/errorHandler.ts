import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

const fastifyErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error.validation) {
    return reply.status(400).send({
      data: null,
      errors: [
        {
          message: "Validation error: " + error.message,
        },
      ],
    });
  }

  console.error("An unexpected error occurred:", error);
  reply.status(500).send({
    data: null,
    errors: [
      {
        message: `An unexpected error occurred: ${error}`,
      },
    ],
  });
};

export default fastifyErrorHandler;
