import { z } from "zod";
import { absoluteHttpUrlSchema } from "../../../shared/validation.js";

// -----------------------------------------------------------------------------
// Zod Schema
// -----------------------------------------------------------------------------

export const auditJobInputSchema = z.object({
  url: absoluteHttpUrlSchema,
  businessType: z
    .string({ message: "Required fields: businessType." })
    .trim()
    .min(1, "Required fields: businessType.")
    .transform((val) => val.slice(0, 120)),
  city: z
    .string({ message: "Required fields: city." })
    .trim()
    .min(1, "Required fields: city.")
    .transform((val) => val.slice(0, 120)),
  state: z
    .string({ message: "Required fields: state." })
    .trim()
    .min(1, "Required fields: state.")
    .transform((val) => val.slice(0, 120)),
});

export type AuditJobInput = z.infer<typeof auditJobInputSchema>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates and normalizes audit job input, returning the typed input or an error string.
 */
export function parseAuditJobInput(body: unknown): AuditJobInput | string {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const input = body as Record<string, unknown>;
  const fields = ["url", "businessType", "city", "state"] as const;
  const missing = fields.filter((field) => !isNonEmptyString(input[field]));
  if (missing.length > 0) {
    return `Required fields: ${missing.join(", ")}.`;
  }

  const result = auditJobInputSchema.safeParse(input);
  if (!result.success) {
    return result.error.issues[0]?.message ?? "Invalid audit input.";
  }

  return result.data;
}
