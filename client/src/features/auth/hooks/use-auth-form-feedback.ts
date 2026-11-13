"use client";

import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { AuthFormValues } from "@/src/features/auth/validations/auth-form-schema";
import { extractGraphQLFieldErrors } from "@/src/shared/lib/validation";

type AuthFeedbackField = keyof AuthFormValues;

const authFeedbackFields: readonly AuthFeedbackField[] = [
  "fullName",
  "email",
  "phone",
  "password",
  "code",
];

function isAuthFeedbackField(field: string): field is AuthFeedbackField {
  return (authFeedbackFields as readonly string[]).includes(field);
}

function getErrorMessage(reason: unknown) {
  if (CombinedGraphQLErrors.is(reason)) {
    return reason.errors[0]?.message ?? reason.message;
  }
  if (ServerError.is(reason)) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return reason instanceof Error ? reason.message : "The request failed. Please try again.";
}

function getErrorField(message: string): AuthFeedbackField | undefined {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("full name") || normalizedMessage.includes("fullname")) return "fullName";
  if (normalizedMessage.includes("phone")) return "phone";
  if (normalizedMessage.includes("reset code") || normalizedMessage.includes("6-digit") ||
    normalizedMessage.includes("6 digit") || normalizedMessage.includes("code must")) return "code";
  if (normalizedMessage.includes("password") || normalizedMessage.includes("newpassword")) return "password";
  if (normalizedMessage.includes("email")) return "email";

  return undefined;
}

export function useAuthFormFeedback(form: UseFormReturn<AuthFormValues>) {
  const [successMessages, setSuccessMessages] = useState<Partial<Record<AuthFeedbackField, string>>>({});

  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      if (!name || !isAuthFeedbackField(name)) return;
      setSuccessMessages((current) => {
        if (!current[name]) return current;
        const next = { ...current };
        delete next[name];
        return next;
      });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const clearFeedback = useCallback(() => {
    setSuccessMessages({});
    form.clearErrors();
  }, [form]);

  const showSuccess = useCallback((field: AuthFeedbackField, message: string) => {
    form.clearErrors("root.server");
    setSuccessMessages({ [field]: message });
  }, [form]);

  const showError = useCallback((reason: unknown) => {
    const message = getErrorMessage(reason);
    setSuccessMessages({});

    const fieldErrors = extractGraphQLFieldErrors(reason);
    let matchedField = false;

    if (Object.keys(fieldErrors).length > 0) {
      for (const [key, msg] of Object.entries(fieldErrors)) {
        if (isAuthFeedbackField(key)) {
          form.setError(key, { type: "server", message: msg });
          matchedField = true;
        }
      }
    }

    if (!matchedField) {
      const field = getErrorField(message);
      if (field) {
        form.setError(field, { type: "server", message });
      } else {
        form.setError("root.server", { type: "server", message });
      }
    }
  }, [form]);

  return { clearFeedback, showError, showSuccess, successMessages };
}
