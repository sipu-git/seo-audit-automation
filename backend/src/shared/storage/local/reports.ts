import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const REPORT_KEY_PATTERN = /^(?:local:)?seo-audit-reports\/([a-zA-Z0-9_-]+)\/report\.pdf$/;

function getReportsRoot() {
  const configuredDirectory = process.env.AUDIT_REPORTS_DIR?.trim();
  return configuredDirectory
    ? path.resolve(configuredDirectory)
    : path.join(tmpdir(), "reports");
}

function getReportLocation(jobId: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(jobId)) {
    throw new Error("Invalid audit job ID for report storage.");
  }

  const key = `local:seo-audit-reports/${jobId}/report.pdf`;
  const filePath = path.join(getReportsRoot(), "seo-audit-reports", jobId, "report.pdf");
  return { key, filePath };
}

export async function storeAuditReportLocally(jobId: string, pdf: Buffer): Promise<string> {
  const { key, filePath } = getReportLocation(jobId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, pdf);
  return key;
}

export function isLocalAuditReportKey(key: string): boolean {
  return REPORT_KEY_PATTERN.test(key);
}

export async function readAuditReport(key: string): Promise<Buffer> {
  const match = REPORT_KEY_PATTERN.exec(key);
  if (!match) {
    throw new Error("Invalid audit report path.");
  }

  const { filePath } = getReportLocation(match[1]);
  return readFile(filePath);
}

