"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_WITH_OTP_MUTATION,
  SIGN_IN_MUTATION,
  SIGN_UP_MUTATION,
  type RequestPasswordResetMutationData,
  type ResetPasswordWithOtpMutationData,
  type SignInMutationData,
  type SignUpMutationData,
} from "@/src/features/auth/api/auth-mutations";
import { CURRENT_USER_QUERY, type CurrentUserQueryData } from "@/src/features/auth/api/auth-queries";
import type { ResetPasswordInput, SignUpInput } from "@/src/features/auth/api/auth-types";
import { setAuthenticated, setUser } from "@/src/features/auth/auth-slice";
import {
  type AuthFormProps,
} from "@/src/features/auth/components/forms/auth-form-fields";
import { ResetConfirmForm } from "@/src/features/auth/components/forms/reset-confirm-form";
import { ResetRequestForm } from "@/src/features/auth/components/forms/reset-request-form";
import { SignInForm } from "@/src/features/auth/components/forms/sign-in-form";
import { SignUpForm } from "@/src/features/auth/components/forms/sign-up-form";
import { useAuthFormFeedback } from "@/src/features/auth/hooks/use-auth-form-feedback";
import {
  createAuthFormSchema,
  type AuthFormMode,
  type AuthFormValues,
} from "@/src/features/auth/validations/auth-form-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useAppDispatch } from "@/src/shared/lib/redux-hooks";
import { useAuthReturnNavigation } from "@/src/features/auth/hooks/use-auth-return-navigation";

const routeByMode: Record<AuthFormMode, string> = {
  "sign-in": "/auth/login",
  "sign-up": "/auth/register",
  "reset-request": "/auth/password-recovery",
  "reset-confirm": "/auth/password-recovery/confirm",
};

export function AuthRoutePage({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const { returnPath, returnQuery } = useAuthReturnNavigation();
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const [signInMutation, { loading: signingIn }] =
    useMutation<SignInMutationData>(SIGN_IN_MUTATION);
  const [signUpMutation, { loading: signingUp }] =
    useMutation<SignUpMutationData>(SIGN_UP_MUTATION);
  const [requestResetMutation, { loading: requestingReset }] =
    useMutation<RequestPasswordResetMutationData>(
      REQUEST_PASSWORD_RESET_MUTATION,
    );
  const [resetPasswordMutation, { loading: resettingPassword }] =
    useMutation<ResetPasswordWithOtpMutationData>(
      RESET_PASSWORD_WITH_OTP_MUTATION,
    );
  const submitting = signingIn || signingUp || requestingReset || resettingPassword;
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthFormSchema(mode)),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      code: "",
    },
  });
  const feedback = useAuthFormFeedback(form);

  function navigateToMode(nextMode: AuthFormMode) {
    router.push(`${routeByMode[nextMode]}${returnQuery}`);
  }

  async function submit(values: AuthFormValues) {
    feedback.clearFeedback();
    try {
      if (mode === "sign-in") {
        const { data } = await signInMutation({
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
        return;
      }

      if (mode === "sign-up") {
        const input: SignUpInput = {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        };
        const { data } = await signUpMutation({ variables: { input } });
        if (!data) throw new Error("Sign-up did not return an account.");
        dispatch(setAuthenticated(true));
        dispatch(setUser(data.signUp.user));
        client.writeQuery<CurrentUserQueryData>({
          query: CURRENT_USER_QUERY,
          data: { me: data.signUp.user },
        });
        router.replace(returnPath);
        return;
      }

      if (mode === "reset-request") {
        const { data } = await requestResetMutation({
          variables: { email: values.email.trim() },
        });
        if (!data) {
          throw new Error("The password reset request returned no result.");
        }
        router.push(
          `${routeByMode["reset-confirm"]}${returnQuery}`,
        );
        return;
      }

      const input: ResetPasswordInput = {
        email: values.email.trim(),
        code: values.code,
        newPassword: values.password,
      };
      const { data } = await resetPasswordMutation({ variables: input });
      if (!data?.resetPasswordWithOtp) {
        throw new Error("The password could not be reset.");
      }
      router.replace(`${routeByMode["sign-in"]}${returnQuery}`);
    } catch (reason) {
      feedback.showError(reason);
    }
  }

  const formProps: AuthFormProps = {
    form,
    feedback,
    submitting,
    onSubmit: submit,
    onSwitch: navigateToMode,
  };
  const titles: Record<AuthFormMode, string> = {
    "sign-in": "Welcome back",
    "sign-up": "Create your account",
    "reset-request": "Reset your password",
    "reset-confirm": "Choose a new password",
  };
  const descriptions: Record<AuthFormMode, string> = {
    "sign-in": "Sign in to continue to your Crawlix workspace.",
    "sign-up": "Create an account to access your Crawlix workspace.",
    "reset-request": "We’ll email you a one-time code to reset your password.",
    "reset-confirm": "Enter the email address, one-time code, and a new password.",
  };

  return (
    <Card className="w-full max-w-md border-slate-200/90 shadow-lg shadow-slate-900/5">
      <CardHeader>
        <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">CRAWLIX WORKSPACE</p>
        <CardTitle>{titles[mode]}</CardTitle>
        <CardDescription>{descriptions[mode]}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {mode === "sign-in" && <SignInForm {...formProps} />}
          {mode === "sign-up" && <SignUpForm {...formProps} />}
          {mode === "reset-request" && <ResetRequestForm {...formProps} />}
          {mode === "reset-confirm" && <ResetConfirmForm {...formProps} />}
        </Form>
      </CardContent>
    </Card>
  );
}
