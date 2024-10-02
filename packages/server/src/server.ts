import fastify, { FastifyInstance } from "fastify";
import { pingRoutes } from "./routes/ping";

const server: FastifyInstance = fastify();
const PORT: number = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await server.register(pingRoutes);
    await server.listen({ port: PORT });
    console.log(`Server listening at http://localhost:${PORT}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

startServer();
