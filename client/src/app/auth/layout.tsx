import { Suspense, type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <Suspense fallback={<p role="status">Loading authentication…</p>}>
        {children}
      </Suspense>
    </main>
  );
}
