import { FastifyInstance } from "fastify";
// import { controlRoleBasedAccess } from "../../middleware/controlRoleBasedAccess";
import {
  // sendNotificationController,
  startNotificationsConnectionController,
  // stopNotificationsConnectionController,
} from "./websockets.controllers";

export const websocketRoutes = async (server: FastifyInstance) => {
  server.get("/", { websocket: true }, startNotificationsConnectionController);

  // server.post(
  //   "/close",
  //   // { websocket: true },
  //   stopNotificationsConnectionController
  // );

  // server.post(
  //   "/send",
  //   // { websocket: true },
  //   sendNotificationController
  // );

  // REST route to send notifications
  // server.post("/send-notification", async (request, reply) => {
  //   const { notificationMessage } = request.body as {
  //     notificationMessage: string;
  //   };
  //   broadcastNotification(notificationMessage); // Send notification to all connected clients
  //   reply.send({ message: "Notification sent" });
  // });
};
