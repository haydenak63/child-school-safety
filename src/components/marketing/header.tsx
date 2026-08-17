"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/primitives";

const links = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/security", label: "Security" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Product">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`min-h-11 rounded-xl px-3 text-sm font-medium transition-colors duration-150 ${
                pathname === link.href ? "text-brand" : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/login" variant="ghost">
            Sign in
          </Button>
          <Button href="/demo">Book a demo</Button>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <span className="block h-0.5 w-4 bg-ink" />
        </button>
      </div>
      {open ? (
        <div id="mobile-nav" className="border-t border-line px-4 py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center text-sm font-medium text-ink-soft"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Button href="/login" variant="secondary">
              Sign in
            </Button>
            <Button href="/demo">Book a demo</Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
