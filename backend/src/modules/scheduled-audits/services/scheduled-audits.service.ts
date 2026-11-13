import { createHash } from "node:crypto";
import { getAuditQueue } from "../../../shared/queue/audit-queue";
import type { AuditJobInput } from "../../audits/validations/audit-input.validation";

function enqueueScheduledAudit(jobId: string, input: AuditJobInput) {
  return getAuditQueue().add("site-audit", input, {
    jobId,
    attempts: 3,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

export async function enqueueScheduledAudits(
  targets: AuditJobInput[],
  interval: string,
  windowKey: string,
) {
  const jobs = await Promise.all(targets.map((target) => {
    const digest = createHash("sha256").update(JSON.stringify(target)).digest("hex").slice(0, 16);
    const jobId = `cron-${windowKey.replace(/[^a-zA-Z0-9_-]/g, "-")}-${digest}`;
    return enqueueScheduledAudit(jobId, target);
  }));
  return jobs.map((job) => ({ jobId: job.id, statusUrl: `/api/audits/${job.id}` }));
}
