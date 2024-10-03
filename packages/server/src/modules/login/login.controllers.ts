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
    return reply.status(401).send({
      data: null,
      errors: [
        {
          message: "Invalid email or password",
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
