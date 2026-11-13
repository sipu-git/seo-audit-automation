"use client";

import type { AuthFormProps } from "@/src/features/auth/components/forms/auth-form-fields";
import {
  AuthFormError,
  AuthSubmitButton,
  EmailField,
  PasswordField,
  ResetCodeField,
} from "@/src/features/auth/components/forms/auth-form-fields";

export function ResetConfirmForm({ form, feedback, submitting, onSubmit, onSwitch }: AuthFormProps) {
  return (
    <>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <EmailField form={form} feedback={feedback} />
        <ResetCodeField form={form} feedback={feedback} />
        <PasswordField form={form} feedback={feedback} mode="reset-confirm" />
        <AuthFormError form={form} />
        <AuthSubmitButton submitting={submitting} label="Reset password" />
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
        <button
          type="button"
          className="font-medium text-emerald-700 hover:underline"
          disabled={submitting}
          onClick={() => onSwitch("reset-request")}
        >
          Send another code
        </button>
        <button
          type="button"
          className="text-slate-600 hover:text-slate-900"
          onClick={() => onSwitch("sign-in")}
        >
          Back to sign in
        </button>
      </div>
    </>
  );
}
