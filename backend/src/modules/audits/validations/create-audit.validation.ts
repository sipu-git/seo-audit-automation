import {
  createValidationError,
  extractFieldErrors,
} from "../../../shared/validation.js";
import {
  auditJobInputSchema,
  parseAuditJobInput,
  type AuditJobInput,
} from "./audit-input.validation.js";

export interface CreateAuditInput {
  input: AuditJobInput;
}

export function validateCreateAudit(mutation: CreateAuditInput): AuditJobInput {
  if (!mutation || typeof mutation !== "object" || !mutation.input) {
    throw createValidationError("Input must be provided.");
  }

  const result = auditJobInputSchema.safeParse(mutation.input);
  if (!result.success) {
    // Check if the legacy parse function returns a specific high-level error (e.g. required fields)
    const legacyParsed = parseAuditJobInput(mutation.input);
    const message = typeof legacyParsed === "string" ? legacyParsed : result.error.issues[0]?.message ?? "Invalid audit input.";
    throw createValidationError(message, extractFieldErrors(result.error));
  }

  return result.data;
}
