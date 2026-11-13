import { z } from "zod";
import {
  auditJobInputSchema,
  parseAuditJobInput,
} from "../../audits/validations/audit-input.validation.js";

export const auditPreviewInputSchema = auditJobInputSchema;
export type AuditPreviewInput = z.infer<typeof auditPreviewInputSchema>;

export function parseAuditPreviewInput(body: unknown): AuditPreviewInput | string {
  return parseAuditJobInput(body);
}
