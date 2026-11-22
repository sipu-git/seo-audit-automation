"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { GOOGLE_SIGN_IN_MUTATION, type GoogleSignInMutationData } from "@/src/features/auth/api/auth-mutations";
import { CURRENT_USER_QUERY, type CurrentUserQueryData } from "@/src/features/auth/api/auth-queries";
import { setAuthenticated, setUser } from "@/src/features/auth/auth-slice";
import { useAppDispatch } from "@/src/shared/lib/redux-hooks";
import Divider from "@/components/ui/divider";

type GoogleCredentialResponse = { credential?: string };

type GoogleIdentityApi = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme: "outline";
      size: "large";
      text: "continue_with";
      shape: "pill";
      width: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityApi } };
  }
}

export function GoogleSignInButton({ onSuccess }: { onSuccess?: () => void }) {
  const apolloClient = useApolloClient();
  const dispatch = useAppDispatch();
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const pendingRef = useRef(false);
  const credentialHandlerRef = useRef<(credential: string) => void>(() => undefined);
  const onSuccessRef = useRef(onSuccess);
  const [scriptReady, setScriptReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const [googleSignIn, { loading }] = useMutation<GoogleSignInMutationData>(GOOGLE_SIGN_IN_MUTATION);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const handleCredential = useCallback(async (credential: string) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setErrorMessage(null);

    try {
      const { data } = await googleSignIn({ variables: { idToken: credential } });
      if (!data) throw new Error("Google sign-in did not return an account.");

      const user = data.googleSignIn.user;
      dispatch(setAuthenticated(true));
      dispatch(setUser(user));
      apolloClient.writeQuery<CurrentUserQueryData>({
        query: CURRENT_USER_QUERY,
        data: { me: user },
      });
      onSuccessRef.current?.();
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : "Google sign-in failed. Please try again.");
    } finally {
      pendingRef.current = false;
    }
  }, [apolloClient, dispatch, googleSignIn]);

  useEffect(() => {
    credentialHandlerRef.current = (credential) => {
      void handleCredential(credential);
    };
  }, [handleCredential]);

  useEffect(() => {
    if (!clientId) setErrorMessage("Google sign-in is not configured for this client.");
  }, [clientId]);

  useEffect(() => {
    const button = buttonRef.current;
    const googleIdentity = window.google?.accounts.id;
    if (!scriptReady || !clientId || !button || !googleIdentity || initializedRef.current) return;

    googleIdentity.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          setErrorMessage("Google did not return a sign-in credential. Please try again.");
          return;
        }
        credentialHandlerRef.current(response.credential);
      },
    });
    googleIdentity.renderButton(button, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: Math.min(400, Math.max(120, button.clientWidth || 400)),
    });
    initializedRef.current = true;
  }, [clientId, scriptReady]);

  return (
    <div className="grid gap-2 w-full">
      {clientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
          onError={() => setErrorMessage("Google sign-in could not load. Check your connection and try again.")}
        />
      )}
      <div aria-busy={loading} className={loading ? "pointer-events-none opacity-60" : undefined}>
        <div ref={buttonRef} className="flex min-h-10 w-full justify-center" />
      </div>
      {loading && (
        <p className="text-center text-xs text-slate-500" role="status">
          Completing Google sign-in…
        </p>
      )}
      {errorMessage && (
        <p className="text-center text-xs font-medium text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <Divider thickness={0.5} color="#c2c1c1">or use email</Divider>
      </div>
    </div>
  );
}
