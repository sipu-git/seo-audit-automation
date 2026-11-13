import type { Prisma } from "../../../generated/prisma/client";
import type { AuditAnalysis } from "../../../shared/llm-integration/types.js";
import { generateAuditPdf } from "../../../shared/reports/pdf/generate.js";
import {
  getS3DownloadUrl,
  isAuditReportReference,
  readLocalAuditReport,
  storeAuditReport,
} from "../../../shared/storage/reports.js";
import { findAuditReport, updateAuditReportPath } from "./audits.service.js";

function hasUsableAnalysis(value: Prisma.JsonValue): value is { [key: string]: Prisma.JsonValue | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    typeof value.overall_score === "number";
}

async function rebuildReport(audit: NonNullable<Awaited<ReturnType<typeof findAuditReport>>>) {
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

  const reportPath = await storeAuditReport(audit.jobId, pdf);
  await updateAuditReportPath(audit.jobId, reportPath);
  console.warn(`Rebuilt missing PDF report for audit ${audit.jobId}.`);
  return reportPath;
}

export async function downloadAuditReport(jobId: string) {
  const audit = await findAuditReport(jobId);
  if (!audit) return { kind: "not_found" as const };

  let reportPath = audit.reportPath;
  if (!reportPath || !isAuditReportReference(reportPath)) {
    reportPath = await rebuildReport(audit);
  }
  if (!reportPath) return { kind: "not_ready" as const };

  const s3Url = await getS3DownloadUrl(reportPath);
  if (s3Url) return { kind: "redirect" as const, url: s3Url };

  let pdf: Buffer;
  try {
    pdf = await readLocalAuditReport(reportPath);
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
    const recoveredPath = await rebuildReport(audit);
    if (!recoveredPath) throw error;
    pdf = await readLocalAuditReport(recoveredPath);
  }
  return { kind: "pdf" as const, pdf };
}
