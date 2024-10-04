import fastify, { FastifyInstance } from "fastify";
import { apiVersion, loggerOptions } from "./config";
import fastifyErrorHandler from "./utils/errorHandler";
import { loginRoutes } from "./modules/login/login.routes";
import { userRoutes } from "./modules/users/users.routes";
import { websocketRoutes } from "./modules/websockets/websockets.routes";
import registerJwtPlugin from "./plugins/jwt";
import registerRateLimitPlugin from "./plugins/rateLimit";
import registerMultipartPlugin from "./plugins/multipart";
import registerWebsocketPlugin from "./plugins/swagger";
import registerSwaggerPlugin from "./plugins/websocket";

const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = process.env.HOST || "0.0.0.0";
const ENVIRONMENT: "development" | "production" | "test" =
  (process.env.ENVIRONMENT as "development" | "production" | "test") ||
  "production";

export const server: FastifyInstance = fastify({
  logger: loggerOptions[ENVIRONMENT],
});

const startServer = async () => {
  try {
    // Register custom handlers
    server.setErrorHandler(fastifyErrorHandler);

    // Register plugins
    await registerJwtPlugin(server);
    await registerRateLimitPlugin(server);
    await registerMultipartPlugin(server);
    await registerWebsocketPlugin(server);
    await registerSwaggerPlugin(server);

    // Register routes
    await server.register(websocketRoutes, {
      prefix: `/api/${apiVersion}/websockets`,
    });
    await server.register(userRoutes, { prefix: `/api/${apiVersion}/users` });
    await server.register(loginRoutes, { prefix: `/api/${apiVersion}/` });
    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

startServer();
