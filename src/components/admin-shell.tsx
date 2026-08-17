"use client";

import { useEffect, useState } from "react";
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
  { href: "/settings", label: "Settings" },
];

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-surface md:flex md:flex-col ${
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
        <nav className="flex-1 space-y-1 p-3">
          {[...links, ...moreLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors duration-150 ${
                active(pathname, link.href)
                  ? "bg-brand text-white"
                  : "text-ink-soft hover:bg-canvas"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {collapsed ? link.label.slice(0, 1) : link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          {collapsed ? null : (
            <>
              <p className="truncate text-sm font-medium text-ink">{adminName}</p>
              <form method="post" action="/api/auth/logout">
                <button type="submit" className="mt-2 min-h-11 text-sm text-ink-muted hover:text-ink">
                  Sign out
                </button>
              </form>
            </>
          )}
          <button
            type="button"
            className="mt-2 hidden min-h-11 text-xs text-ink-muted lg:inline"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "»" : "Collapse"}
          </button>
        </div>
      </aside>

      <div className={`${collapsed ? "md:pl-[76px]" : "md:pl-64"} pb-24 md:pb-0`}>
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="min-w-0">
            <Logo />
            <p className="truncate text-xs text-ink-muted">{schoolName}</p>
          </div>
          <form method="post" action="/api/auth/logout">
            <button type="submit" className="min-h-11 px-2 text-sm text-ink-muted">
              Sign out
            </button>
          </form>
        </header>
        <main className="px-4 py-6 sm:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden">
        <div className="grid grid-cols-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-14 flex-col items-center justify-center text-[11px] font-medium ${
                active(pathname, link.href) ? "text-brand" : "text-ink-muted"
              }`}
            >
              {link.short}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={`flex min-h-14 flex-col items-center justify-center text-[11px] font-medium ${
              moreOpen || moreLinks.some((link) => active(pathname, link.href))
                ? "text-brand"
                : "text-ink-muted"
            }`}
          >
            More
          </button>
        </div>
        {moreOpen ? (
          <div className="border-t border-line px-3 py-3">
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink-soft"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
    </div>
  );
}
