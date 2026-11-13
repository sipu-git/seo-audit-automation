"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/src/shared/lib/redux-hooks";

export default function AuthenticatedLayout({children}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth,
  );
  const authorized = isAuthenticated && user !== null;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const roleDenied = authorized && isAdminRoute && user.role !== "ADMIN";

  useEffect(() => {
    if (!loading && !authorized) {
      router.replace(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`,);
    } else if (roleDenied) {
      router.replace("/");
    }
  }, [authorized, loading, pathname, roleDenied, router]);

  const checkingSession = loading || !authorized || roleDenied;

  return (
    <>
      <div hidden={checkingSession}>{children}</div>
      {checkingSession && (
        <main
          className="grid min-h-screen place-items-center text-sm text-slate-600"
          role="status"
        >
          {roleDenied ? "Returning to your workspace…" : "Checking your session…"}
        </main>
      )}
    </>
  );
}
