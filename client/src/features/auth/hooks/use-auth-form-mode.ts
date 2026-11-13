"use client";

import { useCallback, useState } from "react";
import type { AuthFormMode } from "@/src/features/auth/validations/auth-form-schema";

export function useAuthFormMode(initialMode: AuthFormMode) {
  const [mode, setMode] = useState<AuthFormMode>(initialMode);
  const changeMode = useCallback((nextMode: AuthFormMode) => setMode(nextMode), []);
  return { mode, changeMode };
}
