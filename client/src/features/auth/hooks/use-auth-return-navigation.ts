"use client";

import { useSearchParams } from "next/navigation";

export function useAuthReturnNavigation() {
  const redirectTo = useSearchParams().get("redirectTo");
  const safePath = redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
    ? redirectTo
    : null;

  return {
    returnPath: safePath ?? "/",
    returnQuery: safePath
      ? `?redirectTo=${encodeURIComponent(safePath)}`
      : "",
  };
}
