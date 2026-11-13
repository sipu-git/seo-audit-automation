"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApolloClient } from "@apollo/client/react";
import { Icon } from "@/components/ui/icons";
import { SIGN_OUT_MUTATION } from "@/src/features/auth/api/auth-mutations";
import { AuthDialog } from "@/src/features/auth/components/auth-dialog";
import { clearAuth } from "@/src/features/auth/auth-slice";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/src/shared/lib/redux-hooks";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarSeparator, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { ThemeSwitcher } from "@/src/features/theme/theme-switcher";

const links = [
  { href: "/", label: "Client dashboard", icon: "globe" as const },
  { href: "/audits", label: "Your audits", icon: "chart" as const },
  { href: "/admin", label: "Admin portal", icon: "grid" as const },
  { href: "/profiles", label: "Your profile", icon: "settings" as const },
  { href: "/docs", label: "Project guide", icon: "file" as const },
];

function AppNavigation({ pathname, isAdmin }: { pathname: string; isAdmin: boolean }) {
  const { setOpenMobile } = useSidebar();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setOpenMobile(false);
    }
  }, [pathname, setOpenMobile]);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {links.filter((link) => link.href !== "/admin" || isAdmin).map((link) => {
              const active = link.href === "/" ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={{
                      children: link.label,
                      className: "bg-slate-900 text-white",
                    }}
                    className="hover:bg-[var(--green-soft)] hover:text-[var(--green-dark)] data-[active=true]:bg-[var(--green-soft)] data-[active=true]:text-[var(--green-dark)]"
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon name={link.icon} />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

export function AppShell({
  children,
  eyebrow,
  title,
  description,
  action,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const pathname = usePathname();
  const client = useApolloClient();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");

  function openAuth(mode: "sign-in" | "sign-up") {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  async function signOut() {
    try {
      await client.mutate({ mutation: SIGN_OUT_MUTATION });
    } catch (error) {
      console.error("Unable to clear the authentication cookies.", error);
    } finally {
      dispatch(clearAuth());
      await client.clearStore();
    }
  }

  return (
    <SidebarProvider className="min-h-screen bg-[var(--paper)] border-r border-[var(--line)]">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            className="flex h-10 items-center gap-3 overflow-hidden rounded-md px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            href="/"
            aria-label="Crawlix home"
          >
            {/* <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 group-data-[collapsible=icon]:hidden">
              <Icon name="chart" />
            </span> */}
            <Image
              src="/favicon.ico"
              alt="Crawlix"
              width={120}
              height={40}
              className="h-10 w-[120px] shrink-0 object-contain object-left group-data-[collapsible=icon]:hidden"
            />
          </Link>
        </SidebarHeader>

        <TooltipProvider>
          <AppNavigation pathname={pathname} isAdmin={user?.role === "ADMIN"} />
        </TooltipProvider>

        <SidebarFooter className="gap-0 px-3">
          <div className="flex items-center gap-3 rounded-md bg-[var(--surface-raised)] p-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
            <span className="size-2 shrink-0 rounded-full bg-[var(--green)]" />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <strong className="block text-xs font-semibold text-[var(--ink)]">
                Audit workflow
              </strong>
              <small className="mt-1 block text-[10px] text-[var(--muted)]">
                BullMQ · Redis
              </small>
            </div>
          </div>
          <SidebarSeparator className="my-3 mx-0 w-full" />
          <div className="flex min-w-0 items-center gap-2 px-1 py-1">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--green-soft)] text-xs font-bold text-[var(--green-dark)]">
              S
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <strong className="block truncate text-xs font-semibold text-[var(--ink)]">
                {user?.fullName ?? "Crawlix workspace"}
              </strong>
              <small className="mt-1 block text-[10px] text-[var(--muted)]">
                {user?.email ?? "SEO audit workspace"}
              </small>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-screen bg-[var(--paper)]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-4 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3.5">
            <SidebarTrigger
              className="text-[#015c21]"
              title="Toggle sidebar"
            />
            <div className="flex items-center gap-2.5 text-xs text-[var(--muted)]">
              <span>Workspace</span>
              <span className="text-slate-400">/</span>
              <strong>
                {pathname.startsWith("/docs")
                  ? "Project guide"
                  : pathname.startsWith("/admin")
                    ? "Admin portal"
                    : pathname.startsWith("/profiles")
                      ? "Your profile"
                      : pathname.startsWith("/audits")
                        ? "Your audits"
                        : "Client dashboard"}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <span className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-2 text-[9px] font-bold tracking-[.75px] text-[var(--muted)]">
              <span className="size-1.5 rounded-full bg-emerald-500" /> AUDIT WORKSPACE
            </span>
            {user ? (
              <>
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.fullName}</span>
                <Button variant="outline" size="sm" onClick={() => {
                  signOut();
                }}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" disabled={loading} onClick={() => openAuth("sign-in")}>
                  {loading ? "Loading…" : "Sign in"}
                </Button>
                <Button size="sm" onClick={() => openAuth("sign-up")}>Sign up</Button>
              </>
            )}
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col gap-5 px-4 py-6 md:px-10 md:py-8">
          <div className="mb-1 flex items-end justify-between gap-5 max-[560px]:items-start">
            <div>
              <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">{eyebrow}</p>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">{title}</h1>
              <p className="mt-2 max-w-[650px] text-[13px] leading-relaxed text-[var(--muted)]">{description}</p>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
          {children}
          <footer className="mt-auto flex flex-wrap justify-between gap-3 border-t border-[var(--line)] pt-6 text-[10px] text-[var(--muted)]">
            <span>Crawlix</span>
            <span>SEO intelligence for growing local businesses</span>
            <span>Provider status is reported from each audit</span>
          </footer>
        </div>
      </SidebarInset>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </SidebarProvider>
  );
}
