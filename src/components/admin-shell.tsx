"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";

const links = [
  { href: "/dashboard", label: "Dashboard", short: "Home" },
  { href: "/students", label: "Students", short: "Students" },
  { href: "/attendance", label: "Attendance", short: "Attend" },
  { href: "/terminals", label: "Terminals", short: "Gates" },
];

const moreLinks = [
  { href: "/parents", label: "Parents" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

const allLinks = [...links, ...moreLinks];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Static so Tailwind can see every delay used by the drawer's staggered reveal.
const staggerDelays = [
  "delay-[60ms]",
  "delay-[100ms]",
  "delay-[140ms]",
  "delay-[180ms]",
  "delay-[220ms]",
  "delay-[260ms]",
  "delay-[300ms]",
];

const PANEL_ID = "admin-mobile-nav";

function active(pathname: string, href: string) {
  if (href === "/settings") {
    if (pathname.startsWith("/settings/billing")) return false;
    return pathname === "/settings" || pathname.startsWith("/settings/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavToggleIcon({ open }: { open: boolean }) {
  const bar = `absolute left-0 h-[2px] w-5 rounded-full bg-current transition-[transform,opacity] duration-[220ms] ${EASE} motion-reduce:transition-none`;
  return (
    <span aria-hidden="true" className="relative block h-4 w-5">
      <span className={`${bar} top-0 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
      <span className={`${bar} top-[7px] ${open ? "scale-x-0 opacity-0" : ""}`} />
      <span className={`${bar} top-[14px] ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
    </span>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 8 14"
      fill="none"
      className={`h-3 w-2 shrink-0 ${className}`}
    >
      <path
        d="M1 1l5.5 6L1 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminShell({
  schoolName,
  adminName,
  children,
}: {
  schoolName: string;
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Keyed on the route it was opened from, so any navigation closes it without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navOpen = openPath === pathname;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const headerToggleRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const openFrom = useCallback(
    (trigger: HTMLElement | null) => {
      lastTriggerRef.current = trigger;
      setOpenPath(pathname);
    },
    [pathname],
  );

  const closeNav = useCallback((restoreFocus = true) => {
    setOpenPath(null);
    if (!restoreFocus) return;
    const target = lastTriggerRef.current ?? headerToggleRef.current;
    requestAnimationFrame(() => target?.focus());
  }, []);

  // History navigation can land back on the route the drawer was opened from.
  useEffect(() => {
    const onPopState = () => setOpenPath(null);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeNav();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen, closeNav]);

  useEffect(() => {
    if (!navOpen) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [navOpen]);

  // The drawer only exists below md; growing past that breakpoint must release it.
  useEffect(() => {
    if (!navOpen) return;
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenPath(null);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [navOpen]);

  function trapTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
    ).filter((element) => element.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (event.shiftKey && (current === first || current === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const moreActive = moreLinks.some((link) => active(pathname, link.href));

  return (
    <div className="min-h-screen bg-canvas">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-surface transition-[width] duration-200 ${EASE} motion-reduce:transition-none md:flex md:flex-col ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <div className="border-b border-line px-4 py-5">
          {collapsed ? (
            <Logo className="justify-center [&>span:last-child]:hidden" />
          ) : (
            <>
              <Logo />
              <p className="mt-3 truncate text-sm text-ink-muted">{schoolName}</p>
            </>
          )}
        </div>
        <nav aria-label="Admin pages" className="flex-1 space-y-1 p-3">
          {allLinks.map((link) => {
            const isActive = active(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                aria-current={isActive ? "page" : undefined}
                className={`group flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium outline-none transition-[background-color,color,box-shadow] duration-200 ${EASE} focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:transition-none ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-ink-soft hover:bg-canvas hover:text-ink"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className="truncate">{collapsed ? link.label.slice(0, 1) : link.label}</span>
                {collapsed ? null : (
                  <Chevron
                    className={`ml-auto transition-[transform,opacity] duration-200 ${EASE} motion-reduce:transition-none motion-reduce:transform-none ${
                      isActive
                        ? "opacity-70"
                        : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          {collapsed ? null : (
            <>
              <p className="truncate text-sm font-medium text-ink">{adminName}</p>
              <form method="post" action="/api/auth/logout">
                <button
                  type="submit"
                  className={`mt-2 min-h-11 rounded-lg text-sm text-ink-muted outline-none transition-colors duration-150 ${EASE} hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:transition-none`}
                >
                  Sign out
                </button>
              </form>
            </>
          )}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-2 hidden min-h-11 rounded-lg text-xs text-ink-muted outline-none transition-colors duration-150 ${EASE} hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:transition-none lg:inline`}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "»" : "Collapse"}
          </button>
        </div>
      </aside>

      <div
        className={`min-w-0 overflow-x-clip pb-24 transition-[padding] duration-200 ${EASE} motion-reduce:transition-none md:pb-0 ${
          collapsed ? "md:pl-[76px]" : "md:pl-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="min-w-0">
            <Logo />
            <p className="truncate text-xs text-ink-muted">{schoolName}</p>
          </div>
          <button
            ref={headerToggleRef}
            type="button"
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={navOpen}
            aria-controls={PANEL_ID}
            onClick={(event) =>
              navOpen ? closeNav() : openFrom(event.currentTarget)
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 ${EASE} hover:border-line-strong hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100`}
          >
            <NavToggleIcon open={navOpen} />
          </button>
        </header>
        <main className="px-4 py-6 sm:px-8">{children}</main>
      </div>

      {/* overflow-x-clip contains the off-canvas panel's transform without
          turning this into a scroll container. */}
      <div
        className={`fixed inset-0 z-40 overflow-x-clip md:hidden ${
          navOpen ? "" : "pointer-events-none"
        }`}
        inert={!navOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => closeNav()}
          className={`absolute inset-0 h-full w-full cursor-default bg-ink/35 backdrop-blur-[2px] transition-opacity duration-200 ${EASE} motion-reduce:transition-none ${
            navOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id={PANEL_ID}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          tabIndex={-1}
          onKeyDown={trapTab}
          className={`absolute inset-y-0 right-0 flex w-[min(21rem,88%)] flex-col overflow-y-auto overflow-x-hidden overscroll-contain border-l border-line bg-surface halo-shadow outline-none transition-[transform,opacity] duration-[260ms] ${EASE} motion-reduce:transition-none ${
            navOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Logo />
              <p className="mt-2 truncate text-xs text-ink-muted">{schoolName}</p>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => closeNav()}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink outline-none transition-[background-color,border-color,transform] duration-200 ${EASE} hover:border-line-strong hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100`}
            >
              <NavToggleIcon open={navOpen} />
            </button>
          </div>

          <nav aria-label="Admin pages" className="flex-1 px-3 py-4">
            <p className="eyebrow px-2 pb-2">Navigate</p>
            <ul className="space-y-1">
              {allLinks.map((link, index) => {
                const isActive = active(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => closeNav(false)}
                      className={`group flex min-h-12 items-center gap-3 rounded-[14px] px-3 text-[15px] font-medium outline-none transition-[background-color,color,opacity,transform] duration-[260ms] ${EASE} focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:transition-none motion-reduce:delay-0 ${
                        isActive
                          ? "bg-brand text-white"
                          : "text-ink-soft hover:bg-canvas hover:text-ink"
                      } ${
                        navOpen
                          ? `${staggerDelays[index] ?? "delay-[260ms]"} translate-x-0 opacity-100`
                          : "translate-x-2 opacity-0 delay-0"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-[background-color,transform] duration-200 ${EASE} motion-reduce:transition-none motion-reduce:transform-none ${
                          isActive
                            ? "bg-white"
                            : "scale-75 bg-line-strong group-hover:scale-100 group-hover:bg-brand"
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                      <Chevron
                        className={`ml-auto transition-[transform,opacity] duration-200 ${EASE} motion-reduce:transition-none motion-reduce:transform-none ${
                          isActive
                            ? "opacity-70"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="eyebrow">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium text-ink">{adminName}</p>
            <form method="post" action="/api/auth/logout" className="mt-3">
              <button
                type="submit"
                className={`flex min-h-11 w-full items-center justify-center rounded-full border border-line px-4 text-sm font-medium text-ink-soft outline-none transition-[background-color,border-color,color,transform] duration-200 ${EASE} hover:border-danger/40 hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100`}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 overflow-hidden border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid grid-cols-5">
          {links.map((link) => {
            const isActive = active(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center px-1 text-[11px] font-medium outline-none transition-[background-color,color] duration-150 ${EASE} hover:bg-canvas focus-visible:bg-canvas motion-reduce:transition-none ${
                  isActive ? "text-brand" : "text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 top-0 h-[2px] rounded-full bg-brand transition-transform duration-200 ${EASE} motion-reduce:transition-none motion-reduce:transform-none ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
                <span className="max-w-full truncate">{link.short}</span>
              </Link>
            );
          })}
          <button
            type="button"
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={navOpen}
            aria-controls={PANEL_ID}
            onClick={(event) => (navOpen ? closeNav() : openFrom(event.currentTarget))}
            className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center px-1 text-[11px] font-medium outline-none transition-[background-color,color] duration-150 ${EASE} hover:bg-canvas focus-visible:bg-canvas motion-reduce:transition-none ${
              navOpen || moreActive ? "text-brand" : "text-ink-muted hover:text-ink"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-3 top-0 h-[2px] rounded-full bg-brand transition-transform duration-200 ${EASE} motion-reduce:transition-none motion-reduce:transform-none ${
                navOpen || moreActive ? "scale-x-100" : "scale-x-0"
              }`}
            />
            <span className="max-w-full truncate">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
