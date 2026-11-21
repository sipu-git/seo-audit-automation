import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { getS3StorageConfig } from "../../../../shared/integrations/aws/config";
import { createS3ProfilePictureReference, getS3ProfilePictureObjectKey } from "./profile-picture-references";
import { getS3Client } from "../../../../shared/integrations/aws/client";

const PROFILE_PICTURE_TYPES = {"image/jpeg": "jpg","image/png": "png","image/webp": "webp"} as const;

export type ProfilePictureContentType = keyof typeof PROFILE_PICTURE_TYPES;

export function isProfilePictureContentType(value: string): value is ProfilePictureContentType {
  return Object.hasOwn(PROFILE_PICTURE_TYPES, value);
}

export const mediaFilesUtil = {
   async uploadProfilePictureToS3(userId: string,contentType: ProfilePictureContentType,image: Buffer) {
  const { bucket } = getS3StorageConfig();
  const reference = createS3ProfilePictureReference(userId,randomUUID(),
    PROFILE_PICTURE_TYPES[contentType],
  );
  await getS3Client().send(new PutObjectCommand({
    Bucket: bucket,
    Key: reference.slice("s3:".length),
    Body: image,
    ContentType: contentType,
    ContentLength: image.byteLength,
    CacheControl: "private, max-age=3600",
    ServerSideEncryption: "AES256",
  }));

  return reference;
},
async  getProfilePictureUrl(reference: string): Promise<string> {
  const { bucket } = getS3StorageConfig();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: getS3ProfilePictureObjectKey(reference),
    ResponseCacheControl: "private, max-age=3600",
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
}
}



