import { z } from "zod";
import { validateWithZod } from "../../../shared/validation.js";

export const getAuditsQuerySchema = z.object({
  limit: z
    .number({ message: "limit must be an integer." })
    .int("limit must be an integer.")
    .optional(),
});

export const auditListStatusSchema = z.enum([
  "ALL",
  "QUEUED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const getAuditListQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(4),
  search: z.string().trim().max(200).optional().default(""),
  status: auditListStatusSchema.optional().default("ALL"),
});

export const getAuditStatusQuerySchema = z.object({
  jobId: z
    .string({ message: "jobId is required." })
    .trim()
    .min(1, "jobId is required."),
});

export type GetAuditsQuery = z.infer<typeof getAuditsQuerySchema>;
export type GetAuditListQuery = z.input<typeof getAuditListQuerySchema>;
export type ValidatedGetAuditListQuery = z.output<typeof getAuditListQuerySchema>;
export type GetAuditStatusQuery = z.infer<typeof getAuditStatusQuerySchema>;

export function validateGetAuditListQuery(query: GetAuditListQuery): ValidatedGetAuditListQuery {
  return validateWithZod(getAuditListQuerySchema, query);
}

export function validateGetAuditsQuery(query: GetAuditsQuery): number {
  const validated = validateWithZod(getAuditsQuerySchema, query);
  if (validated.limit === undefined) return 50;
  return Math.min(100, Math.max(1, validated.limit));
}

export function validateGetAuditStatusQuery(query: GetAuditStatusQuery): string {
  const validated = validateWithZod(getAuditStatusQuerySchema, query);
  return validated.jobId;
}
