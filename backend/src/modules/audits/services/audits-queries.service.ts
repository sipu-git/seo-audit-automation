import type { ValidatedGetAuditListQuery } from "../validations/audits.validation.js";
import { getAuditJobStatus, getAuditList, getAudits } from "./audits.service.js";

export function getAuditsHandler(limit: number, ownerId?: string) {
  return getAudits(limit, ownerId);
}

export function getAuditListHandler(input: ValidatedGetAuditListQuery, ownerId?: string) {
  return getAuditList(input, ownerId);
}

export function getAuditStatusHandler(jobId: string) {
  return getAuditJobStatus(jobId);
}
