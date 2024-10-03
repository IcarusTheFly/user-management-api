import { FastifyInstance } from "fastify";
import { loginHandler } from "./login.controllers";
import { loginSchema } from "./login.schemas";

export const loginRoutes = async (server: FastifyInstance) => {
  server.post("/login", loginSchema, loginHandler);
};
