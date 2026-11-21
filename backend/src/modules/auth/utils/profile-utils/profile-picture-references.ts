const S3_PROFILE_PICTURE_PREFIX = "s3:";
const PROFILE_PICTURE_KEY_PATTERN = /^profile-pictures\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+\.(?:jpe?g|png|webp))$/i;

export function createS3ProfilePictureReference(userId: string, fileId: string, extension: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId) || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    throw new Error("Invalid profile picture owner or file ID.");
  }

  const normalizedExtension = extension.toLowerCase();
  if (!["jpg", "jpeg", "png", "webp"].includes(normalizedExtension)) {
    throw new Error("Unsupported profile picture format.");
  }

  return `${S3_PROFILE_PICTURE_PREFIX}profile-pictures/${userId}/${fileId}.${normalizedExtension}`;
}

export function isS3ProfilePictureReference(reference: string) {
  return reference.startsWith(S3_PROFILE_PICTURE_PREFIX) &&
    PROFILE_PICTURE_KEY_PATTERN.test(reference.slice(S3_PROFILE_PICTURE_PREFIX.length));
}

export function getS3ProfilePictureObjectKey(reference: string) {
  if (!isS3ProfilePictureReference(reference)) {
    throw new Error("Invalid S3 profile picture reference.");
  }

  return reference.slice(S3_PROFILE_PICTURE_PREFIX.length);
}

export function isProfilePictureReferenceForUser(reference: string, userId: string) {
  if (!isS3ProfilePictureReference(reference)) return false;
  return reference.startsWith(`${S3_PROFILE_PICTURE_PREFIX}profile-pictures/${userId}/`);
}
