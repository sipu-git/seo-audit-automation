import {
  createValidationError,
  extractFieldErrors,
} from "../../../shared/validation.js";
import {
  auditPreviewInputSchema,
  parseAuditPreviewInput,
  type AuditPreviewInput,
} from "./audit-preview.validation.js";

export interface AuditPreviewInputArgs {
  input: AuditPreviewInput;
}

export function validateAuditPreview(mutation: AuditPreviewInputArgs): AuditPreviewInput {
  if (!mutation || typeof mutation !== "object" || !mutation.input) {
    throw createValidationError("Input must be provided.");
  }

  const result = auditPreviewInputSchema.safeParse(mutation.input);
  if (!result.success) {
    const legacyParsed = parseAuditPreviewInput(mutation.input);
    const message = typeof legacyParsed === "string" ? legacyParsed : result.error.issues[0]?.message ?? "Invalid audit preview input.";
    throw createValidationError(message, extractFieldErrors(result.error));
  }

  return result.data;
}
