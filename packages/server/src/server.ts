import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyJwt from "@fastify/jwt";
import { loggerOptions } from "./config";
import fastifyErrorHandler from "./utils/errorHandler";
import { loginRoutes } from "./modules/login/login.routes";
import { userRoutes } from "./modules/users/users.routes";

const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = process.env.HOST || "0.0.0.0";
const ENV: "development" | "production" | "test" =
  (process.env.ENV as "development" | "production" | "test") || "production";
const JWT_SECRET: string = process.env.JWT_SECRET || "";

export const server: FastifyInstance = fastify({
  logger: loggerOptions[ENV],
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

const startServer = async () => {
  try {
    server.setErrorHandler(fastifyErrorHandler);
    server.register(fastifyJwt, {
      secret: JWT_SECRET,
    });
    server.decorate(
      "authenticate",
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.send(err);
        }
      }
    );

    await server.register(userRoutes, { prefix: "/api/users" });
    await server.register(loginRoutes);
    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

startServer();
