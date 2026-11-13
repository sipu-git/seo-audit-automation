"use client";

import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthReturnNavigation } from "@/src/features/auth/hooks/use-auth-return-navigation";
import { useForm } from "react-hook-form";
import {REQUEST_PASSWORD_RESET_MUTATION,type RequestPasswordResetMutationData} from "@/src/features/auth/api/auth-mutations";
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

export default function PasswordRecoveryPage() {
  const router = useRouter();
  const { returnPath, returnQuery } = useAuthReturnNavigation();
  const [requestReset, { loading }] =useMutation<RequestPasswordResetMutationData>(REQUEST_PASSWORD_RESET_MUTATION);
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthFormSchema("reset-request")),
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
    try {
      const { data } = await requestReset({
        variables: { email: values.email.trim() },
      });
      if (!data) {
        throw new Error("The password reset request returned no result.");
      }
      router.push(`/auth/password-recovery/confirm${returnQuery}`);
    } catch (reason) {
      feedback.showError(reason);
    }
  }

  return (
    <Card className="w-full max-w-md border-slate-200/90 shadow-lg shadow-slate-900/5">
      <CardHeader>
        <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">CRAWLIX WORKSPACE</p>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          We’ll email you a one-time code to reset your password.
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
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="recovery-email">
                Email
              </label>
              <Input
                id="recovery-email"
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
            {form.formState.errors.root?.server?.message && (
              <p className="text-sm font-medium text-red-700" role="alert">
                {form.formState.errors.root.server.message}
              </p>
            )}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <span className="inline-flex gap-2 items-center"><Spinner />Please wait…</span> : "Resend Code"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 border-t border-slate-100 pt-4 text-sm">
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
