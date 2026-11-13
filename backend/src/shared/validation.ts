import { GraphQLError } from "graphql";
import { z } from "zod";

export type FieldErrors = Record<string, string[]>;

export function extractFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

/**
 * Creates a GraphQLError with BAD_USER_INPUT code and structured fieldErrors.
 */
export function createValidationError(
  messageOrError: string | z.ZodError,
  customFieldErrors?: FieldErrors,
): GraphQLError {
  let message: string;
  let fieldErrors: FieldErrors;

  if (typeof messageOrError === "string") {
    message = messageOrError;
    fieldErrors = customFieldErrors ?? { root: [messageOrError] };
  } else {
    fieldErrors = customFieldErrors ?? extractFieldErrors(messageOrError);
    message = messageOrError.issues[0]?.message ?? "Invalid input.";
  }

  return new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      fieldErrors,
      http: { status: 400 },
    },
  });
}

/**
 * Validates data against a Zod schema and throws a GraphQLError on failure.
 */
export function validateWithZod<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw createValidationError(result.error);
  }
  return result.data;
}

export const emailSchema = z.string({ message: "email is required." })
  .trim()
  .max(254, "email must be no more than 254 characters.")
  .toLowerCase()
  .refine(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "email must be a valid email address.",
  );

export const internationalPhoneSchema = z.string({ message: "phone must include a valid international country code." })
  .trim()
  .transform((val) => val.replace(/[\s()-]/g, "").replace(/^\+/, ""))
  .refine(
    (digits) => /^[1-9]\d{7,14}$/.test(digits),
    "phone must include a valid international country code.",
  )
  .transform((digits) => `+${digits}`);

export const optionalPhoneSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return null;
    const trimmed = typeof val === "string" ? val.trim() : "";
    return trimmed.length > 0 ? trimmed : null;
  })
  .pipe(
    z.union([
      z.null(),
      internationalPhoneSchema,
    ]),
  );

/**
 * Password validation for new passwords (8-128 characters, <= 72 UTF-8 bytes).
 */
export const newPasswordSchema = z
  .string({ message: "password is required." })
  .min(8, "password must be between 8 and 128 characters.")
  .max(128, "password must be between 8 and 128 characters.")
  .refine(
    (pw) => Buffer.byteLength(pw, "utf8") <= 72,
    "password must be no more than 72 bytes.",
  );

/**
 * Sign-in password validation (non-empty, max 128 characters).
 */
export const signInPasswordSchema = z
  .string({ message: "email or password is invalid." })
  .min(1, "email or password is invalid.")
  .max(128, "email or password is invalid.");

/**
 * 6-digit numeric OTP code.
 */
export const otpCodeSchema = z
  .string({ message: "code is required." })
  .trim()
  .refine((code) => /^\d{6}$/.test(code), "code must be a 6-digit code.");

/**
 * Full name schema (1-100 characters).
 */
export const fullNameSchema = z
  .string({ message: "fullName is required." })
  .trim()
  .min(1, "fullName must be between 1 and 100 characters.")
  .max(100, "fullName must be between 1 and 100 characters.");

/**
 * URL schema validating absolute HTTP/HTTPS URL without embedded credentials.
 */
export const absoluteHttpUrlSchema = z
  .string({ message: "url is required." })
  .trim()
  .superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({ code: "custom", message: "url is required." });
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(val);
    } catch {
      ctx.addIssue({ code: "custom", message: "url must be a valid absolute URL." });
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({ code: "custom", message: "url must use http or https." });
      return;
    }
    if (parsed.toString().length > 2048) {
      ctx.addIssue({ code: "custom", message: "url must be no longer than 2,048 characters." });
      return;
    }
    if (parsed.username || parsed.password) {
      ctx.addIssue({ code: "custom", message: "url must not contain embedded credentials." });
      return;
    }
  })
  .transform((val) => new URL(val).toString());

/**
 * Trimmed non-empty string with maximum length.
 */
export function trimmedStringSchema(max = 120, fieldName = "Field") {
  return z
    .string({ message: `${fieldName} is required.` })
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(max, `${fieldName} must be no longer than ${max} characters.`);
}
