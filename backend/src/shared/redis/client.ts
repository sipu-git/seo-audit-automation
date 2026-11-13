import IORedis from "ioredis";
import { logRedisConnection } from "./log-connection.js";

type RedisGlobals = typeof globalThis & {
  passwordResetRedis?: IORedis;
};

const globalForRedis = globalThis as RedisGlobals;

export function getRedisClient() {
  if (globalForRedis.passwordResetRedis) {
    return globalForRedis.passwordResetRedis;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is missing. Add the Redis connection URL to backend/.env.");
  }

  const redis = new IORedis(redisUrl, { maxRetriesPerRequest: 1 });
  logRedisConnection(redis, "password-reset");
  globalForRedis.passwordResetRedis = redis;
  return redis;
}

export async function closeRedisClient() {
  const redis = globalForRedis.passwordResetRedis;
  delete globalForRedis.passwordResetRedis;
  if (redis && redis.status !== "end") await redis.quit();
}
