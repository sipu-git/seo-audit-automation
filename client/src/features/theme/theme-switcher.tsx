"use client";

import { useState } from "react";
import { Check, Palette, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/src/shared/lib/redux-hooks";
import { setTheme, type ThemeAccent } from "./theme-slice";

const options: { id: ThemeAccent; label: string; color: string }[] = [
  { id: "sage", label: "Sage", color: "#0e9f75" },
  { id: "ocean", label: "Ocean", color: "#2879c7" },
  { id: "violet", label: "Violet", color: "#7956c9" },
];

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { mode, accent } = useAppSelector((state) => state.theme);
  const update = (nextMode: typeof mode, nextAccent: ThemeAccent) =>
    dispatch(setTheme({ mode: nextMode, accent: nextAccent }));

  return (
    <div className="relative inline-flex">
      <Button variant="outline" size="icon" className="border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]" aria-label="Customize appearance" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Palette aria-hidden="true" />
      </Button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[280px] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--ink)] shadow-2xl" role="dialog" aria-label="Appearance settings">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 text-[var(--green)]"><div><strong className="block text-[13px] text-[var(--ink)]">Appearance</strong><span className="mt-1 block text-[10px] text-[var(--muted)]">Make your workspace yours</span></div><Palette aria-hidden="true" /></div>
          <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Color mode">
            <button type="button" className={`flex min-h-10 items-center gap-2 rounded-xl border px-2 text-[11px] ${mode === "light" ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-dark)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"}`} onClick={() => update("light", accent)}><Sun /> Light {mode === "light" && <Check />}</button>
            <button type="button" className={`flex min-h-10 items-center gap-2 rounded-xl border px-2 text-[11px] ${mode === "dark" ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-dark)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"}`} onClick={() => update("dark", accent)}><Moon /> Dark {mode === "dark" && <Check />}</button>
          </div>
          <p className="mb-2 mt-4 text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Accent color</p>
          <div className="grid gap-1.5">
            {options.map((option) => (
              <button key={option.id} type="button" className={`flex min-h-[34px] items-center gap-2 rounded-xl border px-2 text-[11px] ${accent === option.id ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-dark)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"}`} aria-label={`${option.label} accent`} aria-pressed={accent === option.id} onClick={() => update(mode, option.id)}>
                <span className="size-3.5 rounded-full" style={{ background: option.color }} />{option.label}{accent === option.id && <Check className="ml-auto size-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
