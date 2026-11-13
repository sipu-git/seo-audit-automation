"use client";

import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthReturnNavigation } from "@/src/features/auth/hooks/use-auth-return-navigation";
import { useForm } from "react-hook-form";
import {
  RESET_PASSWORD_WITH_OTP_MUTATION,
  type ResetPasswordWithOtpMutationData,
} from "@/src/features/auth/api/auth-mutations";
import type { ResetPasswordInput } from "@/src/features/auth/api/auth-types";
import { useAuthFormFeedback } from "@/src/features/auth/hooks/use-auth-form-feedback";
import {
  createAuthFormSchema,
  type AuthFormValues,
} from "@/src/features/auth/validations/auth-form-schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordRecoveryConfirmPage() {
  const router = useRouter();
  const { returnPath, returnQuery } = useAuthReturnNavigation();
    const [togglePassword, setTogglePassword] = useState(false);

  const [resetPassword, { loading }] =
    useMutation<ResetPasswordWithOtpMutationData>(
      RESET_PASSWORD_WITH_OTP_MUTATION,
    );
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthFormSchema("reset-confirm")),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      code: "",
    },
  });
  const feedback = useAuthFormFeedback(form);

  async function submit(values: AuthFormValues) {
    feedback.clearFeedback();
    const input: ResetPasswordInput = {
      email: values.email.trim(),
      code: values.code,
      newPassword: values.password,
    };

    try {
      const { data } = await resetPassword({ variables: input });
      if (!data?.resetPasswordWithOtp) {
        throw new Error("The password could not be reset.");
      }
      router.replace(`/auth/login${returnQuery}`);
    } catch (reason) {
      feedback.showError(reason);
    }
  }

  return (
    <Card className="w-full max-w-md border-slate-200/90 shadow-lg shadow-slate-900/5">
      <CardHeader>
        <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">CRAWLIX WORKSPACE</p>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          Enter the email address, one-time code, and a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(submit)}
            noValidate
          >
            <div className="grid gap-2">
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="confirm-email">
                Email
              </label>
              <Input
                id="confirm-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                maxLength={254}
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              {form.formState.errors.email?.message && (
                <p className="text-xs font-medium text-red-700" role="alert">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="confirm-code">
                6-digit email code
              </label>
              <Input
                id="confirm-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="******"
                pattern="[0-9]{6}"
                maxLength={6}
                aria-invalid={Boolean(form.formState.errors.code)}
                {...form.register("code")}
              />
              {form.formState.errors.code?.message && (
                <p className="text-xs font-medium text-red-700" role="alert">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="confirm-password">
                New password
              </label>
              <div className="">
              <Input
                id="confirm-password"
                type={togglePassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="********"
                minLength={8}
                maxLength={128}
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
               <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]"
                  aria-label={togglePassword ? "Hide password" : "Show password"}
                  aria-controls="login-password"
                  aria-pressed={togglePassword}
                  onClick={() => setTogglePassword((visible) => !visible)}
                >
                  {togglePassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password?.message && (
                <p className="text-xs font-medium text-red-700" role="alert">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            {form.formState.errors.root?.server?.message && (
              <p className="text-sm font-medium text-red-700" role="alert">
                {form.formState.errors.root.server.message}
              </p>
            )}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <span className="inline-flex gap-2 items-center"><Spinner />Please wait…</span> : "Reset Password"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
          <Link
            className="font-medium text-emerald-700 hover:underline"
            href={`/auth/password-recovery${returnQuery}`}
          >
            Send another code
          </Link>
          <Link
            className="text-slate-600 hover:text-slate-900"
            href={`/auth/login${returnQuery}`}
          >
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
