import { createHmac, randomInt, randomUUID } from "node:crypto";
import { GraphQLError } from "graphql";
import { prisma } from "../../../db/client.js";
import { normalizeEmail } from "../validations/auth.validation.js";
import { hashPassword } from "./password.service.js";
import { BrevoEmailError, sendPasswordResetEmail } from "./brevo-email.service.js";
import {
  claimPasswordResetCode, completePasswordReset, markPasswordResetEmailFailed, markPasswordResetEmailSent,
  reservePasswordResetRequest, restorePasswordResetCode, savePendingPasswordReset
} from "./password-reset.store.js";

function secret() {
  const value = process.env.PASSWORD_RESET_OTP_SECRET;
  if (!value || Buffer.byteLength(value, "utf8") < 32) {
    throw new Error("PASSWORD_RESET_OTP_SECRET must be configured with at least 32 characters.");
  }
  return value;
}

function hashValue(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function genericResponse() {
  return { message: "If an account exists for this email, a password reset code will be sent." };
}

function invalidCode(): never {
  throw new GraphQLError("The reset code is invalid or expired.", {
    extensions: { code: "BAD_USER_INPUT" },
  });
}

export async function requestPasswordReset(emailInput: string, clientIp: string) {
  const email = normalizeEmail(emailInput);
  const identityHash = hashValue(`email:${email}`);
  const ipHash = hashValue(`ip:${clientIp}`);
  if (!(await reservePasswordResetRequest(identityHash, ipHash))) return genericResponse();

  const account = await prisma.auth.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!account) return genericResponse();

  const code = String(randomInt(100_000, 1_000_000));
  const logId = randomUUID();
  await savePendingPasswordReset({
    identityHash,
    authId: account.id,
    codeHash: hashValue(`otp:${identityHash}:${code}`),
    logId,
    requestedAt: new Date().toISOString(),
  });

  try {
    await sendPasswordResetEmail(email, code);
    await markPasswordResetEmailSent(identityHash, logId);
  } catch (error) {
    const failure = error instanceof BrevoEmailError
      ? error.status === null ? "brevo_network_error" : `brevo_http_${error.status}`
      : "email_delivery_error";
    await markPasswordResetEmailFailed(identityHash, logId, failure);
    console.error("Password-reset email delivery failed.", {
      reason: error instanceof Error ? error.message : "Unknown email delivery error.",
    });
  }

  return genericResponse();
}

export async function resetPasswordWithOtp(input: {
  email: string;
  code: string;
  newPassword: string;
}) {
  const email = normalizeEmail(input.email);
  const identityHash = hashValue(`email:${email}`);
  const challenge = await claimPasswordResetCode(
    identityHash,
    hashValue(`otp:${identityHash}:${input.code}`),
  );
  if (!challenge) invalidCode();

  try {
    await prisma.auth.update({
      where: { id: challenge.authId },
      data: {
        password: await hashPassword(input.newPassword),
      },
    });
  } catch (error) {
    await restorePasswordResetCode(identityHash);
    throw error;
  }

  await completePasswordReset(identityHash, challenge.logId);
  return true;
}
