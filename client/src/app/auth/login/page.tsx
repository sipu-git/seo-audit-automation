"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { SIGN_IN_MUTATION, type SignInMutationData } from "@/src/features/auth/api/auth-mutations";
import { CURRENT_USER_QUERY, type CurrentUserQueryData } from "@/src/features/auth/api/auth-queries";
import { setAuthenticated, setUser } from "@/src/features/auth/auth-slice";
import { useAuthFormFeedback } from "@/src/features/auth/hooks/use-auth-form-feedback";
import { createAuthFormSchema, type AuthFormValues } from "@/src/features/auth/validations/auth-form-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/src/shared/lib/redux-hooks";
import { useAuthReturnNavigation } from "@/src/features/auth/hooks/use-auth-return-navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import Divider from "@/components/ui/divider";

export default function LoginPage() {
  const router = useRouter();
  const { returnPath, returnQuery } = useAuthReturnNavigation();
  const client = useApolloClient();
  const dispatch = useAppDispatch();
  const [togglePassword, setTogglePassword] = useState(false);

  const [signIn, { loading }] = useMutation<SignInMutationData>(SIGN_IN_MUTATION);
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthFormSchema("sign-in")),
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
      const { data } = await signIn({
        variables: {
          input: { email: values.email, password: values.password },
        },
      });
      if (!data) throw new Error("Sign-in did not return an account.");
      dispatch(setAuthenticated(true));
      dispatch(setUser(data.signIn.user));
      client.writeQuery<CurrentUserQueryData>({
        query: CURRENT_USER_QUERY,
        data: { me: data.signIn.user },
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
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue to your Crawlix workspace.
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
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="login-email">
                Email
              </label>
              <Input
                id="login-email"
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
              <label className="block text-xs font-semibold text-[var(--ink)]" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={togglePassword ? "text" : "password"}
                  placeholder="********"
                  autoComplete="current-password"
                  maxLength={128}
                  aria-invalid={Boolean(form.formState.errors.password)}
                  className="pr-10"
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
        <Divider variant="solid" thickness={0.2} color="#ccd2d1" className="my-8">OR</Divider>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <Link
            className="font-medium text-emerald-700 hover:underline"
            href={`/auth/password-recovery${returnQuery}`}
          >
            Forgot password?
          </Link>
          <Link
            className="text-slate-600 hover:text-slate-900"
            href={`/auth/register${returnQuery}`}
          >
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
