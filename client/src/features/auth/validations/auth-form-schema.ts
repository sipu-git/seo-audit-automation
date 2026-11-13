import { z } from "zod";
import {
  emailRule,
  fullNameRule,
  newPasswordRule,
  otpCodeRule,
  phoneRule,
  signInPasswordRule,
} from "@/src/shared/lib/validation";

export type AuthFormMode = "sign-in" | "sign-up" | "reset-request" | "reset-confirm";

export const baseAuthFormSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  password: z.string(),
  code: z.string(),
});

export type AuthFormValues = z.infer<typeof baseAuthFormSchema>;

export const signInFormSchema = z.object({
  email: emailRule,
  password: signInPasswordRule,
});

export const signUpFormSchema = z.object({
  fullName: fullNameRule,
  email: emailRule,
  password: newPasswordRule,
  phone: phoneRule.optional(),
});

export const resetRequestFormSchema = z.object({
  email: emailRule,
});

export const resetConfirmFormSchema = z.object({
  email: emailRule,
  code: otpCodeRule,
  password: newPasswordRule,
});

export function createAuthFormSchema(mode: AuthFormMode) {
  return baseAuthFormSchema.superRefine((values, context) => {
    const addIssue = (field: keyof AuthFormValues, message: string) => {
      context.addIssue({ code: "custom", path: [field], message });
    };

    const emailResult = emailRule.safeParse(values.email);
    if (!emailResult.success) {
      addIssue("email", "Enter a valid email address (maximum 254 characters).");
    }

    if (mode === "sign-up") {
      const nameResult = fullNameRule.safeParse(values.fullName);
      if (!nameResult.success) {
        addIssue("fullName", "Full name must be between 1 and 100 characters.");
      }

      const pwResult = newPasswordRule.safeParse(values.password);
      if (!pwResult.success) {
        addIssue("password", "Use 8–128 characters and no more than 72 UTF-8 bytes.");
      }

      if (values.phone.trim()) {
        const phoneResult = phoneRule.safeParse(values.phone);
        if (!phoneResult.success) {
          addIssue("phone", "Enter a valid international phone number.");
        }
      }
    } else if (mode === "sign-in") {
      const pwResult = signInPasswordRule.safeParse(values.password);
      if (!pwResult.success) {
        addIssue("password", "Enter a password (maximum 128 characters).");
      }
    } else if (mode === "reset-confirm") {
      const codeResult = otpCodeRule.safeParse(values.code);
      if (!codeResult.success) {
        addIssue("code", "Enter the 6-digit code from your email.");
      }

      const pwResult = newPasswordRule.safeParse(values.password);
      if (!pwResult.success) {
        addIssue("password", "Use 8–128 characters and no more than 72 UTF-8 bytes.");
      }
    }
  });
}
