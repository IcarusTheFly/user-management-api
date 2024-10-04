export const startNotificationsConnectionSchema = {
  description: "WebSocket connection for notifications",
  tags: ["Websockets"],
  summary: "Establish a Websocket connection for real-time notifications",
  securityDefinitions: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  response: {
    101: {
      description: "Switching Protocols - Connection upgraded to WebSocket",
    },
    400: {
      description: "Bad Request - Invalid WebSocket handshake request",
    },
    401: {
      description: "Unauthorized - Missing or invalid JWT token",
    },
  },
};
