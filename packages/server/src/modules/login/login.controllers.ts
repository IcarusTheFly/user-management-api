import { FastifyReply, FastifyRequest } from "fastify";
import { LoginInput } from "./login.types";
import { server } from "../../server";
import { authenticateUser } from "./login.services";
import { validateLogin } from "./login.validators";

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  const validationErrors = validateLogin(email, password);
  if (validationErrors.length > 0) {
    request.log.error("Validation error");
    return reply.status(400).send({
      errors: validationErrors,
    });
  }

  const user = await authenticateUser(email, password);

  if (user === null) {
    const errorMessage = "Invalid email or password";
    request.log.error(errorMessage);
    return reply.status(401).send({
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
