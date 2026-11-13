import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3StorageConfig } from "./config";
import { getS3Client } from "./client";
import { getS3ReportObjectKey } from "./references";

export async function createS3ReportDownloadUrl(reference: string): Promise<string> {
  const { bucket } = getS3StorageConfig();
  const key = getS3ReportObjectKey(reference);
  const jobId = /seo-audit-reports\/([a-zA-Z0-9_-]+)\/report\.pdf$/.exec(key)?.[1] ?? "report";
  const fileName = `seo-audit-${jobId}.pdf`;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
    ResponseCacheControl: "private, no-store",
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 300 });
}
