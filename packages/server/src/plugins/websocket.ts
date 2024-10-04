import { FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";

const registerWebsocketPlugin = async (server: FastifyInstance) => {
  await server.register(fastifyWebsocket);
};

export default registerWebsocketPlugin;
