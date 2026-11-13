import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { AuditJobInput } from "../../modules/audits/validations/audit-input.validation";
import { logRedisConnection } from "../redis/log-connection.js";

export type { AuditJobInput } from "../../modules/audits/validations/audit-input.validation";

export const SEO_AUDIT_QUEUE = "seo-audit-jobs";

type QueueGlobals = typeof globalThis & {
  seoAuditQueue?: Queue<AuditJobInput>;
  seoAuditRedis?: IORedis;
};

const globalForQueue = globalThis as QueueGlobals;

export function getAuditQueue() {
  if (globalForQueue.seoAuditQueue) {
    return globalForQueue.seoAuditQueue;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is missing. Add the Redis connection URL to backend/.env.");
  }

  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: 1 });
  logRedisConnection(connection, "audit-queue");
  const queue = new Queue<AuditJobInput>(SEO_AUDIT_QUEUE, { connection });

  globalForQueue.seoAuditRedis = connection;
  globalForQueue.seoAuditQueue = queue;
  return queue;
}

export async function closeAuditQueue() {
  const queue = globalForQueue.seoAuditQueue;
  const connection = globalForQueue.seoAuditRedis;
  delete globalForQueue.seoAuditQueue;
  delete globalForQueue.seoAuditRedis;

  if (queue) await queue.close();
  if (connection && connection.status !== "end") await connection.quit();
}
