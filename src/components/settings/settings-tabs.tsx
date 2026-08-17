"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; exact?: boolean };

export function SettingsTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
    >
      {tabs.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-[13px] font-semibold transition-colors duration-150 sm:px-4 ${
              isActive
                ? "bg-brand text-white"
                : "border border-line bg-surface text-ink-soft hover:bg-canvas hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
