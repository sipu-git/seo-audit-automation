"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/shared/lib/redux-hooks";
import { hydrateTheme, type ThemeAccent } from "./theme-slice";

const STORAGE_KEY = "crawlix-theme";
const accents: ThemeAccent[] = ["sage", "ocean", "violet"];

export function ThemeInitializer() {
  const dispatch = useAppDispatch();
  const { mode, accent, hydrated } = useAppSelector((state) => state.theme);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { mode?: unknown; accent?: unknown };
        dispatch(hydrateTheme({
          mode: parsed.mode === "dark" ? "dark" : "light",
          accent: accents.includes(parsed.accent as ThemeAccent) ? parsed.accent as ThemeAccent : "sage",
        }));
      } else {
        dispatch(hydrateTheme({ mode: "light", accent: "sage" }));
      }
    } catch {
      dispatch(hydrateTheme({ mode: "light", accent: "sage" }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.accent = accent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accent }));
  }, [mode, accent, hydrated]);

  return null;
}
