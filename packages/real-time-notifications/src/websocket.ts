import { WebSocket } from "ws";

const clients: Set<WebSocket> = new Set();

export const openWebSocketConnection = (socket: WebSocket) => {
  clients.add(socket);
  console.info("[WS] Connection opened");

  socket.on("message", (message: string) => {
    console.log("[WS] Message received:", message);
  });

  socket.on("close", () => {
    clients.delete(socket);
    console.info("[WS] Connection closed");
  });
};

export const broadcastNotification = (message: string) => {
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ message }));
    }
  });
};
