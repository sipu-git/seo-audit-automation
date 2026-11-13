import { timingSafeEqual } from "node:crypto";
import type IORedis from "ioredis";
import { getRedisClient } from "../../../shared/redis/client.js";

const OTP_TTL_SECONDS = 5 * 60;
const LOG_TTL_SECONDS = 30 * 24 * 60 * 60;
const REQUEST_COOLDOWN_SECONDS = 60;
const HOURLY_REQUEST_LIMIT = 10;
const MAX_OTP_ATTEMPTS = 5;

interface NewChallenge {
  identityHash: string;
  authId: string;
  codeHash: string;
  logId: string;
  requestedAt: string;
}

interface PasswordResetChallenge {
  authId: string;
  logId: string;
}

function challengeKey(identityHash: string) {
  return `auth:password-reset:challenge:${identityHash}`;
}

function logKey(logId: string) {
  return `auth:password-reset:log:${logId}`;
}

function matchesCode(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(provided, "hex");
  return expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer);
}

function transactionWasCancelled(
  results: Awaited<ReturnType<ReturnType<IORedis["multi"]>["exec"]>>,
) {
  if (!results) return true;
  const error = results.find(([commandError]) => commandError)?.[0];
  if (error) throw error;
  return false;
}

export async function reservePasswordResetRequest(identityHash: string, ipHash: string) {
  const redis = getRedisClient();
  const identityCountKey = `auth:password-reset:hourly:identity:${identityHash}`;
  const ipCountKey = `auth:password-reset:hourly:ip:${ipHash}`;
  const cooldownKey = `auth:password-reset:cooldown:${identityHash}`;

  const identityCount = await redis.incr(identityCountKey);
  if (identityCount === 1) await redis.expire(identityCountKey, 60 * 60);
  const ipCount = await redis.incr(ipCountKey);
  if (ipCount === 1) await redis.expire(ipCountKey, 60 * 60);
  if (identityCount > HOURLY_REQUEST_LIMIT || ipCount > HOURLY_REQUEST_LIMIT) return false;

  return (await redis.set(cooldownKey, "1", "EX", REQUEST_COOLDOWN_SECONDS, "NX")) === "OK";
}

export async function savePendingPasswordReset(input: NewChallenge) {
  const redis = getRedisClient();
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

  await redis
    .multi()
    .hset(challengeKey(input.identityHash), {
      authId: input.authId,
      codeHash: input.codeHash,
      attempts: "0",
      status: "pending",
      logId: input.logId,
    })
    .expire(challengeKey(input.identityHash), OTP_TTL_SECONDS)
    .hset(logKey(input.logId), {
      identityHash: input.identityHash,
      provider: "brevo",
      template: "password-reset-v1",
      status: "pending",
      requestedAt: input.requestedAt,
      expiresAt,
    })
    .expire(logKey(input.logId), LOG_TTL_SECONDS)
    .exec();
}

export async function markPasswordResetEmailSent(identityHash: string, logId: string) {
  const redis = getRedisClient();
  await redis
    .multi()
    .hset(challengeKey(identityHash), "status", "sent")
    .hset(logKey(logId), "status", "sent")
    .exec();
}

export async function markPasswordResetEmailFailed(
  identityHash: string,
  logId: string,
  failure: string,
) {
  const redis = getRedisClient();
  await redis
    .multi()
    .del(challengeKey(identityHash))
    .hset(logKey(logId), { status: "failed", failure })
    .exec();
}

export async function claimPasswordResetCode(identityHash: string, providedCodeHash: string) {
  const redis = getRedisClient();
  const key = challengeKey(identityHash);
  const connection = redis.duplicate();

  try {
    for (let retry = 0; retry < 5; retry += 1) {
      await connection.watch(key);
      const challenge = await connection.hgetall(key);
      const attempts = Number(challenge.attempts);
      if (challenge.status !== "sent" || !challenge.authId || !challenge.codeHash ||
          !challenge.logId || !Number.isInteger(attempts) || attempts >= MAX_OTP_ATTEMPTS) {
        await connection.unwatch();
        return null;
      }

      const valid = matchesCode(challenge.codeHash, providedCodeHash);
      const transaction = connection.multi();
      if (valid) {
        transaction.hset(key, "status", "verifying");
      } else {
        transaction.hincrby(key, "attempts", 1);
        if (attempts + 1 >= MAX_OTP_ATTEMPTS) transaction.hset(key, "status", "exhausted");
      }

      const results = await transaction.exec();
      if (transactionWasCancelled(results)) continue;

      if (!valid) {
        if (attempts + 1 >= MAX_OTP_ATTEMPTS) {
          await redis.hset(logKey(challenge.logId), "status", "exhausted");
        }
        return null;
      }

      return { authId: challenge.authId, logId: challenge.logId } satisfies PasswordResetChallenge;
    }

    throw new Error("Could not validate the reset code after concurrent attempts.");
  } finally {
    if (connection.status !== "end") await connection.quit();
  }
}

export async function restorePasswordResetCode(identityHash: string) {
  await getRedisClient().hset(challengeKey(identityHash), "status", "sent");
}

export async function completePasswordReset(identityHash: string, logId: string) {
  const redis = getRedisClient();
  await redis
    .multi()
    .del(challengeKey(identityHash))
    .hset(logKey(logId), "status", "consumed")
    .exec();
}
