import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3StorageConfig } from "./config";
import { getS3Client } from "./client";
import { createS3ReportReference, getS3ReportObjectKey } from "./references";

export async function uploadAuditReportToS3(jobId: string, pdf: Buffer): Promise<string> {
  const reference = createS3ReportReference(jobId);
  const { bucket } = getS3StorageConfig();
  const key = getS3ReportObjectKey(reference);

  await getS3Client().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: pdf,
    ContentType: "application/pdf",
    CacheControl: "private, max-age=0, no-store",
    ServerSideEncryption: "AES256",
    Metadata: { "audit-job-id": jobId },
  }));

  return reference;
}
