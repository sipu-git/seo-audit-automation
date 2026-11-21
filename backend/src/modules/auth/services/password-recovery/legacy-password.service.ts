import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: 64 * 1024 * 1024,
    }, (error, key) => error ? reject(error) : resolve(key as Buffer));
  });
}

export async function verifyLegacyPassword(password: string, encodedHash: string) {
  const [algorithm, n, r, p, saltText, keyText, extra] = encodedHash.split("$");
  if (algorithm !== "scrypt" || extra !== undefined || !saltText || !keyText) return false;
  if (n !== String(SCRYPT_N) || r !== String(SCRYPT_R) || p !== String(SCRYPT_P)) return false;

  try {
    const salt = Buffer.from(saltText, "base64url");
    const expectedKey = Buffer.from(keyText, "base64url");
    if (salt.length !== 16 || expectedKey.length !== KEY_LENGTH) return false;
    const actualKey = await deriveKey(password, salt);
    return timingSafeEqual(actualKey, expectedKey);
  } catch {
    return false;
  }
}
