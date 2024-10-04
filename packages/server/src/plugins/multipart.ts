import { FastifyInstance } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import { fileUploadOptions } from "../config";

const registerMultipartPlugin = async (server: FastifyInstance) => {
  server.register(fastifyMultipart, fileUploadOptions);
};

export default registerMultipartPlugin;
