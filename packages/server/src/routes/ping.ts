import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { pingController } from "../controllers/pingController";

export const pingRoutes = async (server: FastifyInstance) => {
  server.get("/ping", async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await pingController();
    reply.send(response);
  });
};
