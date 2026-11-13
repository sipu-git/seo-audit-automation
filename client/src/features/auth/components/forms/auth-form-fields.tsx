"use client";

import type { ComponentProps } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useAuthFormFeedback } from "@/src/features/auth/hooks/use-auth-form-feedback";
import type {
  AuthFormMode,
  AuthFormValues,
} from "@/src/features/auth/validations/auth-form-schema";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export type AuthFormProps = {
  form: UseFormReturn<AuthFormValues>;
  feedback: ReturnType<typeof useAuthFormFeedback>;
  submitting: boolean;
  onSubmit: SubmitHandler<AuthFormValues>;
  onSwitch: (mode: AuthFormMode) => void;
};

type AuthFieldName = "fullName" | "email" | "phone" | "code" | "password";
type AuthInputProps = Omit<
  ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>;

function AuthField({
  form,
  feedback,
  name,
  label,
  inputProps,
}: Pick<AuthFormProps, "form" | "feedback"> & {
  name: AuthFieldName;
  label: React.ReactNode;
  inputProps: AuthInputProps;
}) {
  const success = feedback.successMessages[name];

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...inputProps} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
          <FormDescription
            className={success ? "text-emerald-700" : "sr-only"}
            role={success ? "status" : undefined}
          >
            {success ?? ""}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}

export function FullNameField({
  form,
  feedback,
}: Pick<AuthFormProps, "form" | "feedback">) {
  return (
    <AuthField
      form={form}
      feedback={feedback}
      name="fullName"
      label="Full name"
      inputProps={{
        placeholder: "John Alice",
        autoComplete: "name",
        maxLength: 100,
      }}
    />
  );
}

export function EmailField({
  form,
  feedback,
}: Pick<AuthFormProps, "form" | "feedback">) {
  return (
    <AuthField
      form={form}
      feedback={feedback}
      name="email"
      label="Email"
      inputProps={{
        type: "email",
        placeholder: "john123@gmail.com",
        autoComplete: "email",
        maxLength: 254,
      }}
    />
  );
}

export function PhoneField({
  form,
  feedback,
}: Pick<AuthFormProps, "form" | "feedback">) {
  return (
    <AuthField
      form={form}
      feedback={feedback}
      name="phone"
      label={
        <>
          Phone <span className="font-normal text-slate-400">(optional)</span>
        </>
      }
      inputProps={{
        type: "tel",
        autoComplete: "tel",
        placeholder: "+919876543210",
      }}
    />
  );
}

export function ResetCodeField({
  form,
  feedback,
}: Pick<AuthFormProps, "form" | "feedback">) {
  return (
    <AuthField
      form={form}
      feedback={feedback}
      name="code"
      label="6-digit email code"
      inputProps={{
        inputMode: "numeric",
        autoComplete: "one-time-code",
        placeholder: "******",
        pattern: "[0-9]{6}",
        maxLength: 6,
      }}
    />
  );
}

export function PasswordField({
  form,
  feedback,
  mode,
}: Pick<AuthFormProps, "form" | "feedback"> & {
  mode: Extract<AuthFormMode, "sign-in" | "sign-up" | "reset-confirm">;
}) {
  const isSignIn = mode === "sign-in";

  return (
    <AuthField
      form={form}
      feedback={feedback}
      name="password"
      label={mode === "reset-confirm" ? "New password" : "Password"}
      inputProps={{
        type: "password",
        autoComplete: isSignIn ? "current-password" : "new-password",
        minLength: 8,
        placeholder: "********",
        maxLength: 128,
      }}
    />
  );
}

export function AuthFormError({
  form,
}: Pick<AuthFormProps, "form">) {
  const message = form.formState.errors.root?.server?.message;
  if (!message) return null;
  return (
    <p className="text-sm font-medium text-red-700" role="alert">
      {message}
    </p>
  );
}

export function AuthSubmitButton({
  submitting,
  label,
}: {
  submitting: boolean;
  label: string;
}) {
  return (
    <Button type="submit" className="w-full" disabled={submitting}>
      {submitting ? "Please wait…" : label}
    </Button>
  );
}
