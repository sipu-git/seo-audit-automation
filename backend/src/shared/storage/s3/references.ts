const S3_REPORT_PREFIX = "s3:";
const REPORT_KEY_PATTERN = /^seo-audit-reports\/([a-zA-Z0-9_-]+)\/report\.pdf$/;

export function createS3ReportReference(jobId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(jobId)) {
    throw new Error("Invalid audit job ID for S3 storage.");
  }

  return `${S3_REPORT_PREFIX}seo-audit-reports/${jobId}/report.pdf`;
}

export function isS3ReportReference(reference: string): boolean {
  return reference.startsWith(S3_REPORT_PREFIX) &&
    REPORT_KEY_PATTERN.test(reference.slice(S3_REPORT_PREFIX.length));
}

export function getS3ReportObjectKey(reference: string): string {
  if (!isS3ReportReference(reference)) {
    throw new Error("Invalid S3 report reference.");
  }

  return reference.slice(S3_REPORT_PREFIX.length);
}
