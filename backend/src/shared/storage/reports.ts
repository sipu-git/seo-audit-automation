import { readAuditReport, isLocalAuditReportKey, storeAuditReportLocally } from "./local/reports";
import { hasS3StorageConfig } from "./s3/config";
import {
  createS3ReportDownloadUrl,
  isS3ReportReference,
  uploadAuditReportToS3,
} from "./s3/reports";

export async function storeAuditReport(jobId: string, pdf: Buffer): Promise<string> {
  const configuredProvider = process.env.AUDIT_REPORT_STORAGE?.trim().toLowerCase();
  const provider = configuredProvider || (hasS3StorageConfig() ? "s3" : "local");

  if (provider === "s3") {
    return uploadAuditReportToS3(jobId, pdf);
  }
  if (provider === "local") {
    return storeAuditReportLocally(jobId, pdf);
  }
  throw new Error("AUDIT_REPORT_STORAGE must be set to 's3' or 'local'.");
}

export function isAuditReportReference(reference: string): boolean {
  return isLocalAuditReportKey(reference) || isS3ReportReference(reference);
}

export async function getS3DownloadUrl(reference: string): Promise<string | null> {
  return isS3ReportReference(reference) ? createS3ReportDownloadUrl(reference) : null;
}

export async function readLocalAuditReport(reference: string): Promise<Buffer> {
  return readAuditReport(reference);
}
