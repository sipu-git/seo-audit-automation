import { S3Client } from "@aws-sdk/client-s3";
import { getS3StorageConfig } from "./config";

let s3Client: S3Client | undefined;

export function getS3Client() {
  if (!s3Client) {
    const { region, credentials } = getS3StorageConfig();
    s3Client = new S3Client({ region, ...(credentials ? { credentials } : {}) });
  }

  return s3Client;
}
