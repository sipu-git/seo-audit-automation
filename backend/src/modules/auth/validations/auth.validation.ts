import { z } from "zod";
import {emailSchema,fullNameSchema,internationalPhoneSchema,newPasswordSchema,optionalPhoneSchema,
  otpCodeSchema,signInPasswordSchema,validateWithZod,
} from "../../../shared/validation.js";

export const signUpSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: newPasswordSchema,
  phone: optionalPhoneSchema.optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: signInPasswordSchema,
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  newPassword: newPasswordSchema,
});


export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// -----------------------------------------------------------------------------
// Validation & Normalization Functions
// -----------------------------------------------------------------------------

export function normalizeEmail(value: string): string {
  return validateWithZod(emailSchema, value);
}

export function normalizePhone(value: string): string {
  return validateWithZod(internationalPhoneSchema, value);
}

export function validateSignUpInput(input: unknown): SignUpInput {
  return validateWithZod(signUpSchema, input);
}

export function validateSignInInput(input: unknown): SignInInput {
  return validateWithZod(signInSchema, input);
}

export function validateRequestPasswordResetInput(input: unknown): RequestPasswordResetInput {
  return validateWithZod(requestPasswordResetSchema, input);
}

export function validateResetPasswordInput(input: unknown): ResetPasswordInput {
  return validateWithZod(resetPasswordSchema, input);
}
