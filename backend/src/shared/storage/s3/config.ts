export type S3StorageConfig = {
  bucket: string;
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export function getS3StorageConfig(): S3StorageConfig {
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const region = process.env.AWS_REGION?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  const missing = Object.entries({ AWS_S3_BUCKET: bucket, AWS_REGION: region })
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`AWS S3 configuration is missing: ${missing.join(", ")}.`);
  }

  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error("Set both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or use the AWS credential provider chain.");
  }

  return {
    bucket: bucket!,
    region: region!,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  };
}

export function hasS3StorageConfig() {
  return Boolean(process.env.AWS_REGION?.trim() && process.env.AWS_S3_BUCKET?.trim());
}
