import { FastifyInstance } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
const RATE_LIMIT: number = Number(process.env.RATE_LIMIT) || 50;
const RATE_LIMIT_TIME_WINDOW: string =
  process.env.RATE_LIMIT_TIME_WINDOW || "1 minute";

const registerRateLimitPlugin = async (server: FastifyInstance) => {
  await server.register(fastifyRateLimit, {
    max: RATE_LIMIT,
    timeWindow: RATE_LIMIT_TIME_WINDOW,
  });
};

export default registerRateLimitPlugin;
