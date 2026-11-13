import type IORedis from "ioredis";

export function logRedisConnection(redis: IORedis, clientName: string) {
  redis.on("connect", () => {
    console.log(`[redis:${clientName}] TCP/TLS socket connected.`);
  });

  redis.on("ready", () => {
    console.log(`[redis:${clientName}] connection ready.`);
  });

  redis.on("close", () => {
    console.error(`[redis:${clientName}] socket closed before Redis became ready; state=${redis.status}.`);
  });

  redis.on("end", () => {
    console.error(`[redis:${clientName}] connection ended; automatic reconnect has stopped.`);
  });

  redis.on("reconnecting", (delayMs: number) => {
    console.warn(`[redis:${clientName}] reconnecting in ${delayMs}ms.`);
  });

  redis.on("error", (error: Error & { code?: string }) => {
    console.error(`[redis:${clientName}] connection error:`, {
      name: error.name,
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
    });
  });
}
