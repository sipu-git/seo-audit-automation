"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {REQUEST_PASSWORD_RESET_MUTATION,RESET_PASSWORD_WITH_OTP_MUTATION,
  SIGN_IN_MUTATION,SIGN_UP_MUTATION,
  type RequestPasswordResetMutationData,
  type ResetPasswordWithOtpMutationData,
  type SignInMutationData,
  type SignUpMutationData,
} from "@/src/features/auth/api/auth-mutations";
import { CURRENT_USER_QUERY, type CurrentUserQueryData } from "@/src/features/auth/api/auth-queries";
import type { ResetPasswordInput, SignUpInput } from "@/src/features/auth/api/auth-types";
import { useAuthFormFeedback } from "@/src/features/auth/hooks/use-auth-form-feedback";
import { useAuthFormMode } from "@/src/features/auth/hooks/use-auth-form-mode";
import {createAuthFormSchema,type AuthFormMode,type AuthFormValues} from "@/src/features/auth/validations/auth-form-schema";
import { setAuthenticated, setUser } from "@/src/features/auth/auth-slice";
import { ResetConfirmForm } from "@/src/features/auth/components/forms/reset-confirm-form";
import { ResetRequestForm } from "@/src/features/auth/components/forms/reset-request-form";
import { SignInForm } from "@/src/features/auth/components/forms/sign-in-form";
import { SignUpForm } from "@/src/features/auth/components/forms/sign-up-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useAppDispatch } from "@/src/shared/lib/redux-hooks";

export function AuthDialog({ open, onOpenChange, initialMode = "sign-in" }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "sign-in" | "sign-up";
}) {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const [signInMutation, { loading: signingIn }] = useMutation<SignInMutationData>(SIGN_IN_MUTATION);
  const [signUpMutation, { loading: signingUp }] = useMutation<SignUpMutationData>(SIGN_UP_MUTATION);
  const [requestResetMutation, { loading: requestingReset }] =
    useMutation<RequestPasswordResetMutationData>(REQUEST_PASSWORD_RESET_MUTATION);
  const [resetPasswordMutation, { loading: resettingPassword }] =
    useMutation<ResetPasswordWithOtpMutationData>(RESET_PASSWORD_WITH_OTP_MUTATION);
  const submitting = signingIn || signingUp || requestingReset || resettingPassword;
  const { mode, changeMode: setMode } = useAuthFormMode(initialMode);
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

  function changeMode(nextMode: AuthFormMode) {
    setMode(nextMode);
    form.setValue("password", "", { shouldValidate: false });
    form.setValue("code", "", { shouldValidate: false });
    feedback.clearFeedback();
  }

  function close() {
    onOpenChange(false);
    form.setValue("password", "", { shouldValidate: false });
    form.setValue("code", "", { shouldValidate: false });
    feedback.clearFeedback();
  }

  async function submit(values: AuthFormValues) {
    feedback.clearFeedback();
    try {
      if (mode === "sign-in") {
        const { data } = await signInMutation({
          variables: { input: { email: values.email, password: values.password } },
        });
        if (!data) throw new Error("Sign-in did not return an account.");
        dispatch(setAuthenticated(true));
        dispatch(setUser(data.signIn.user));
        client.writeQuery<CurrentUserQueryData>({
          query: CURRENT_USER_QUERY,
          data: { me: data.signIn.user },
        });
        close();
      } else if (mode === "sign-up") {
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
        close();
      } else if (mode === "reset-request") {
        const { data } = await requestResetMutation({ variables: { email: values.email.trim() } });
        if (!data) throw new Error("The password reset request returned no result.");
        changeMode("reset-confirm");
        feedback.showSuccess("email", data.requestPasswordReset.message);
      } else {
        const input: ResetPasswordInput = {
          email: values.email,
          code: values.code,
          newPassword: values.password,
        };
        
        const { data } = await resetPasswordMutation({ variables: input });
        if (!data?.resetPasswordWithOtp) {
          throw new Error("The password could not be reset.");
        }
        form.setValue("password", "");
        form.setValue("code", "");
        changeMode("sign-in");
        feedback.showSuccess("email", "Password reset. Sign in with your new password.");
      }
    } catch (reason) {
      feedback.showError(reason);
    }
  }

  const isSignUp = mode === "sign-up";
  const isReset = mode === "reset-request" || mode === "reset-confirm";
  const title = isSignUp
    ? "Create your account"
    : isReset
      ? mode === "reset-request"
        ? "Reset your password"
        : "Enter your reset code"
      : "Welcome back";
  const description = isSignUp
    ? "Create an account to access your Crawlix workspace."
    : isReset
      ? "We’ll email you a one-time code to reset your password."
      : "Sign in to continue to your Crawlix workspace.";

  function renderForm(currentMode: AuthFormMode) {
    const formProps = {
      form,
      feedback,
      submitting,
      onSubmit: submit,
      onSwitch: changeMode,
    };

    switch (currentMode) {
      case "sign-up":
        return <SignUpForm {...formProps} />;
      case "reset-request":
        return <ResetRequestForm {...formProps} />;
      case "reset-confirm":
        return <ResetConfirmForm {...formProps} />;
      default:
        return <SignInForm {...formProps} />;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setMode(initialMode);
          feedback.clearFeedback();
        } else {
          close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>{renderForm(mode)}</Form>
      </DialogContent>
    </Dialog>
  );
}
