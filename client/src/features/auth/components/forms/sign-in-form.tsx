"use client";

import type { AuthFormProps } from "@/src/features/auth/components/forms/auth-form-fields";
import {
  AuthFormError,
  AuthSubmitButton,
  EmailField,
  PasswordField,
} from "@/src/features/auth/components/forms/auth-form-fields";

export function SignInForm({ form, feedback, submitting, onSubmit, onSwitch }: AuthFormProps) {
  return (
    <>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <EmailField form={form} feedback={feedback} />
        <PasswordField form={form} feedback={feedback} mode="sign-in" />
        <AuthFormError form={form} />
        <AuthSubmitButton submitting={submitting} label="Sign in" />
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
        <button
          type="button"
          className="font-medium text-emerald-700 hover:underline"
          onClick={() => onSwitch("reset-request")}
        >
          Forgot password?
        </button>
        <button
          type="button"
          className="text-slate-600 hover:text-slate-900"
          onClick={() => onSwitch("sign-up")}
        >
          Create account
        </button>
      </div>
    </>
  );
}
