import { FastifyInstance } from "fastify";
import { startNotificationsConnectionController } from "./websockets.controllers";
import { startNotificationsConnectionSchema } from "./websockets.schemas";

export const websocketRoutes = async (server: FastifyInstance) => {
  server.get(
    "/",
    {
      websocket: true,
      schema: startNotificationsConnectionSchema,
    },
    startNotificationsConnectionController
  );
};
