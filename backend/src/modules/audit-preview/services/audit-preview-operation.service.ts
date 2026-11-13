import { getAuditPreview } from "./audit-preview.service.js";
import type { AuditPreviewInput } from "../validations/audit-preview.validation.js";

export function auditPreviewHandler(input: AuditPreviewInput) {
  return getAuditPreview(input);
}
