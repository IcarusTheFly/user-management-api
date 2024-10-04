import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const registerSwaggerPlugin = async (server: FastifyInstance) => {
  server.register(fastifySwagger, {
    swagger: {
      info: {
        title: "User Management API",
        description: "API documentation for the User Management API",
        version: "1.0.0",
      },
      consumes: ["application/json", "multipart/form-data"],
      produces: ["application/json"],
    },
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: "/documentation/ui",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
    staticCSP: true,
  });
};

export default registerSwaggerPlugin;
