import type { Prisma } from "../../../generated/prisma/client";
import type { AuditAnalysis } from "../../audit-preview/analysis-report/types.js";
import { generateAuditPdf } from "../../audit-preview/templates/pdf/generate.js";
import { findAuditReport } from "./audits.service.js";

function hasUsableAnalysis(value: Prisma.JsonValue): value is { [key: string]: Prisma.JsonValue | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    typeof value.overall_score === "number";
}

async function generateReport(audit: NonNullable<Awaited<ReturnType<typeof findAuditReport>>>) {
  if (audit.status !== "COMPLETED" || !audit.analysis || !hasUsableAnalysis(audit.analysis)) {
    return null;
  }

  const pdf = await generateAuditPdf({
    jobId: audit.jobId,
    createdAt: audit.createdAt,
    business: {
      url: audit.url,
      businessType: audit.businessType,
      city: audit.city,
      state: audit.state,
    },
    analysis: audit.analysis as unknown as AuditAnalysis,
    dataSources: audit.dataSources && typeof audit.dataSources === "object" && !Array.isArray(audit.dataSources)
      ? Object.fromEntries(
        Object.entries(audit.dataSources).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
      )
      : undefined,
    note: audit.note,
  });

  return pdf;
}

export async function downloadAuditReport(jobId: string) {
  const audit = await findAuditReport(jobId);
  if (!audit) return { kind: "not_found" as const };

  if (audit.status !== "COMPLETED" || !audit.analysis || !hasUsableAnalysis(audit.analysis)) {
    return { kind: "not_ready" as const };
  }
  const pdf = await generateReport(audit);
  if (!pdf) return { kind: "not_ready" as const };
  return { kind: "pdf" as const, pdf };
}
