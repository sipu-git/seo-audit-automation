import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export function isBcryptPasswordHash(encodedHash: string) {
  return /^\$2[aby]\$\d{2}\$/.test(encodedHash);
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, encodedHash: string) {
  if (!isBcryptPasswordHash(encodedHash) || Buffer.byteLength(password, "utf8") > 72) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(password, encodedHash);
}
