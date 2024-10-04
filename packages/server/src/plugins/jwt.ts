import { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";

const JWT_SECRET: string = process.env.JWT_SECRET || "";

const registerJwtPlugin = async (server: FastifyInstance) => {
  await server.register(fastifyJwt, {
    secret: JWT_SECRET,
  });
};

export default registerJwtPlugin;
