import "dotenv/config";
import { UnrecoverableError, Worker } from "bullmq";
import IORedis from "ioredis";
import type { AuditJobInput } from "../audits/validations/audit-input.validation";
import { SEO_AUDIT_QUEUE } from "../../shared/queue/audit-queue";
import { closePdfBrowser } from "../../shared/reports/pdf/browser";
import { logRedisConnection } from "../../shared/redis/log-connection.js";
import { processAuditJob } from "./services/audit-processing.service";

export function startAuditWorker() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is missing. Add the Redis URL to backend/.env.");
  }

  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  logRedisConnection(connection, "audit-worker");

  const worker = new Worker<AuditJobInput>(
    SEO_AUDIT_QUEUE,
    processAuditJob,
    { connection },
  );

  worker.on("ready", () => console.log(`Worker listening on ${SEO_AUDIT_QUEUE}`));
  worker.on("error", (error) => {
    console.error("Audit worker runtime error:", error);
  });
  worker.on("completed", (job) => console.log(`Audit job ${job.id} completed.`));
  worker.on("failed", (job, error) => {
    if (
      job &&
      !(error instanceof UnrecoverableError) &&
      job.attemptsMade < (job.opts.attempts ?? 1)
    ) {
      console.warn(
        `Audit job ${job.id} attempt ${job.attemptsMade} failed; retrying automatically:`,
        error,
      );
      return;
    }
    console.error(`Audit job ${job?.id ?? "unknown"} failed:`, error);
  });

  let isShuttingDown = false;
  return async function shutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    await worker.close();
    await closePdfBrowser();
    if (connection.status !== "end") await connection.quit();
  };
}
