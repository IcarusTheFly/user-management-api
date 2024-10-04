import { openWebSocketConnection } from "@user-management-api/real-time-notifications";
import { WebSocket } from "ws";
import { FastifyRequest } from "fastify";

export const startNotificationsConnectionController = async (
  socket: WebSocket,
  request: FastifyRequest
) => {
  try {
    await request.jwtVerify();

    openWebSocketConnection(socket);
    request.log.info("Websocket connection open");
  } catch (error) {
    socket.close();
    request.log.error(error);
  }
};
