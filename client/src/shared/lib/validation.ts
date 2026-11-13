import { z } from "zod";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

/**
 * Validates and normalizes an email address.
 */
export const emailRule = z
  .string({ message: "Enter an email address." })
  .trim()
  .min(1, "Enter an email address.")
  .max(254, "Email must be no more than 254 characters.")
  .refine(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "Enter a valid email address (e.g. name@domain.com).",
  );

/**
 * Validates international phone numbers.
 */
export const phoneRule = z
  .string()
  .trim()
  .refine((val) => {
    if (!val) return true;
    const digits = val.replace(/[\s()-]/g, "").replace(/^\+/, "");
    return /^[1-9]\d{7,14}$/.test(digits);
  }, "Enter a valid international phone number (e.g. +91 9876543210).");

/**
 * Validates new passwords (8-128 chars, <= 72 bytes).
 */
export const newPasswordRule = z
  .string({ message: "Enter a password." })
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be no more than 128 characters.")
  .refine(
    (pw) => new TextEncoder().encode(pw).length <= 72,
    "Password must be no more than 72 UTF-8 bytes.",
  );

/**
 * Validates sign-in password.
 */
export const signInPasswordRule = z
  .string({ message: "Enter your password." })
  .min(1, "Enter your password.")
  .max(128, "Password must be no more than 128 characters.");

/**
 * Validates 6-digit verification code.
 */
export const otpCodeRule = z
  .string({ message: "Enter the verification code." })
  .trim()
  .refine((val) => /^\d{6}$/.test(val), "Enter the 6-digit code from your email.");

/**
 * Validates full name.
 */
export const fullNameRule = z
  .string({ message: "Enter your full name." })
  .trim()
  .min(1, "Full name must be at least 1 character.")
  .max(100, "Full name must be no more than 100 characters.");

/**
 * Validates absolute HTTP/HTTPS URL without embedded credentials.
 */
export const urlRule = z
  .string({ message: "Enter a website URL." })
  .trim()
  .min(1, "Enter a website URL.")
  .superRefine((val, ctx) => {
    let parsed: URL;
    try {
      parsed = new URL(val);
    } catch {
      ctx.addIssue({ code: "custom", message: "Enter a full URL, including https://." });
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({ code: "custom", message: "URL must use http:// or https://." });
      return;
    }
    if (parsed.toString().length > 2048) {
      ctx.addIssue({ code: "custom", message: "URL must be no longer than 2,048 characters." });
      return;
    }
    if (parsed.username || parsed.password) {
      ctx.addIssue({ code: "custom", message: "URL must not contain embedded credentials." });
      return;
    }
  });

/**
 * Creates a trimmed non-empty string schema.
 */
export function trimmedStringRule(fieldName: string, max = 120) {
  return z
    .string({ message: `Enter the ${fieldName.toLowerCase()}.` })
    .trim()
    .min(1, `Enter the ${fieldName.toLowerCase()}.`)
    .max(max, `${fieldName} must be no more than ${max} characters.`);
}

/**
 * Extracts field-level error messages from Apollo GraphQL errors.
 */
export function extractGraphQLFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (!CombinedGraphQLErrors.is(error)) return result;

  const graphQLError = error.errors[0];
  if (graphQLError?.extensions?.fieldErrors) {
    for (const [key, val] of Object.entries(graphQLError.extensions.fieldErrors)) {
      result[key] = Array.isArray(val) ? val[0] : val;
    }
  }

  return result;
}
