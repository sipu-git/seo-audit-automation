import { createAudit, deleteAudit } from "./audits.service.js";
import type { AuditJobInput } from "../validations/audit-input.validation.js";

export async function createAuditHandler(input: AuditJobInput, ownerId: string) {
  const job = await createAudit(input, ownerId);
  return {
    jobId: job.id,
    status: "queued",
    statusUrl: `/api/audits/${job.id}`,
  };
}

export async function deleteAuditHandler(jobId: string, ownerId: string) {
  const audit = await deleteAudit(jobId, ownerId);
  if (!audit) {
    throw new Error("Audit not found or you do not have permission to delete it.");
  }
  return true;
}
