import fastify, { FastifyInstance } from "fastify";
import { loggerOptions } from "./config";
import fastifyErrorHandler from "./utils/errorHandler";
import { userRoutes } from "./modules/users/users.routes";

const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = process.env.HOST || "0.0.0.0";
const ENV: "development" | "production" | "test" =
  (process.env.ENV as "development" | "production" | "test") || "production";

const server: FastifyInstance = fastify({
  logger: loggerOptions[ENV],
});

server.setErrorHandler(fastifyErrorHandler);

const startServer = async () => {
  try {
    await server.register(userRoutes, { prefix: "/api/users" });
    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

startServer();
