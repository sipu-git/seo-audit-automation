"use client";

import type { AuthFormProps } from "@/src/features/auth/components/forms/auth-form-fields";
import {AuthFormError,AuthSubmitButton,EmailField,FullNameField,PasswordField,PhoneField,} from "@/src/features/auth/components/forms/auth-form-fields";

export function SignUpForm({ form, feedback, submitting, onSubmit, onSwitch }: AuthFormProps) {
  return (
    <>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FullNameField form={form} feedback={feedback} />
        <EmailField form={form} feedback={feedback} />
        <PhoneField form={form} feedback={feedback} />
        <PasswordField form={form} feedback={feedback} mode="sign-up" />
        <AuthFormError form={form} />
        <AuthSubmitButton submitting={submitting} label="Create account" />
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
        <button
          type="button"
          className="text-slate-600 hover:text-slate-900"
          onClick={() => onSwitch("sign-in")}
        >
          Already have an account? Sign in
        </button>
      </div>
    </>
  );
}
