import fastify, { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyMultipart from "@fastify/multipart";
import fastifyWebsocket from "@fastify/websocket";
import { fileUploadOptions, loggerOptions } from "./config";
import fastifyErrorHandler from "./utils/errorHandler";
import { loginRoutes } from "./modules/login/login.routes";
import { userRoutes } from "./modules/users/users.routes";
import { websocketRoutes } from "./modules/websockets/websockets.routes";

const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = process.env.HOST || "0.0.0.0";
const ENVIRONMENT: "development" | "production" | "test" =
  (process.env.ENVIRONMENT as "development" | "production" | "test") ||
  "production";
const JWT_SECRET: string = process.env.JWT_SECRET || "";
const RATE_LIMIT: number = Number(process.env.RATE_LIMIT) || 50;
const RATE_LIMIT_TIME_WINDOW: string =
  process.env.RATE_LIMIT_TIME_WINDOW || "1 minute";

export const server: FastifyInstance = fastify({
  logger: loggerOptions[ENVIRONMENT],
});

const startServer = async () => {
  try {
    server.setErrorHandler(fastifyErrorHandler);
    await server.register(fastifyJwt, {
      secret: JWT_SECRET,
    });
    await server.register(fastifyRateLimit, {
      max: RATE_LIMIT,
      timeWindow: RATE_LIMIT_TIME_WINDOW,
    });
    await server.register(fastifyMultipart, fileUploadOptions);
    await server.register(fastifyWebsocket);

    await server.register(websocketRoutes, { prefix: "/api/websockets" });
    await server.register(userRoutes, { prefix: "/api/users" });
    await server.register(loginRoutes);
    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

startServer();
