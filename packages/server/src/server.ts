import fastify, { FastifyInstance } from "fastify";
import { pingRoutes } from "./routes/ping";
import { userRoutes } from "./modules/users/users.routes";
import fastifyErrorHandler from "./utils/errorHandler";

const server: FastifyInstance = fastify();
const PORT: number = Number(process.env.PORT) || 3000;

server.setErrorHandler(fastifyErrorHandler);

const startServer = async () => {
  try {
    await server.register(pingRoutes);
    await server.register(userRoutes, { prefix: "/api/users" });
    await server.listen({ port: PORT });

    console.log(`Server listening at http://localhost:${PORT}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

startServer();
