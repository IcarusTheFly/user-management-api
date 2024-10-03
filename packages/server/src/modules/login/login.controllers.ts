import { FastifyReply, FastifyRequest } from "fastify";
import { LoginInput } from "./login.types";
import { server } from "../../server";
import { authenticateUser } from "./login.services";

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  const user = await authenticateUser(body.email, body.password);

  if (user === null) {
    const errorMessage = "Invalid email or password";
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

  const token = server.jwt.sign({
    ...user,
    password: undefined,
    salt: undefined,
  });
  return reply.send({ accessToken: token });
}
