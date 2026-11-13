"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  SIGN_UP_MUTATION,
  type SignUpMutationData,
} from "@/src/features/auth/api/auth-mutations";
import {
  CURRENT_USER_QUERY,
  type CurrentUserQueryData,
} from "@/src/features/auth/api/auth-queries";
import type { SignUpInput } from "@/src/features/auth/api/auth-types";
import { setAuthenticated, setUser } from "@/src/features/auth/auth-slice";
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
import { useAppDispatch } from "@/src/shared/lib/redux-hooks";
import { useAuthReturnNavigation } from "@/src/features/auth/hooks/use-auth-return-navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterPage() {
  const router = useRouter();
  const { returnPath, returnQuery } = useAuthReturnNavigation();
  const client = useApolloClient();
  const dispatch = useAppDispatch();
  const [signUp, { loading }] = useMutation<SignUpMutationData>(SIGN_UP_MUTATION);
  const [togglePassword, setTogglePassword] = useState(false);


  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthFormSchema("sign-up")),
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
      const input: SignUpInput = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      };
      const { data } = await signUp({ variables: { input } });
      if (!data) throw new Error("Sign-up did not return an account.");
      dispatch(setAuthenticated(true));
      dispatch(setUser(data.signUp.user));
      client.writeQuery<CurrentUserQueryData>({
        query: CURRENT_USER_QUERY,
        data: { me: data.signUp.user },
      });
      router.replace(returnPath);
    } catch (reason) {
      feedback.showError(reason);
    }
  }

  return (
    <Card className="w-full max-w-md border-slate-200/90 shadow-lg shadow-slate-900/5">
      <CardHeader>
        <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">CRAWLIX WORKSPACE</p>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Create an account to access your Crawlix workspace.
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
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="register-name">
                Full name
              </label>
              <Input
                id="register-name"
                placeholder="John Alice"
                autoComplete="name"
                maxLength={100}
                aria-invalid={Boolean(form.formState.errors.fullName)}
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName?.message && (
                <p className="text-xs font-medium text-red-700" role="alert">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="register-email">
                Email
              </label>
              <Input
                id="register-email"
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
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="register-phone">
                Phone <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <Input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+919876543210"
                aria-invalid={Boolean(form.formState.errors.phone)}
                {...form.register("phone")}
              />
              {form.formState.errors.phone?.message && (
                <p className="text-xs font-medium text-red-700" role="alert">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="register-password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="register-password"
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
              {loading ? <span className="inline-flex gap-2 items-center"><Spinner />Please wait…</span> : "Sign in"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 border-t border-slate-100 pt-4 text-sm">
          <Link
            className="text-slate-600 hover:text-slate-900"
            href={`/auth/login${returnQuery}`}
          >
            Already have an account? Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
