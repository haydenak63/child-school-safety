"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-[padding,background,box-shadow,border-color] duration-300 ${
        scrolled
          ? "border-b border-line bg-white/80 py-3 shadow-[0_8px_24px_-18px_rgba(20,20,43,0.25)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Product">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm transition-colors duration-150 ${
                pathname === link.href ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/login" className="text-sm text-ink-muted hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/demo"
            className="marketing-btn-primary inline-flex min-h-10 items-center rounded-[9px] px-4 text-[13.5px] font-semibold"
          >
            Book a demo
          </Link>
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
        <div id="mobile-nav" className="border-t border-line px-5 py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center text-sm font-medium text-ink-muted"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/login" className="flex min-h-11 items-center text-sm text-ink">
              Sign in
            </Link>
            <Link
              href="/register"
              className="flex min-h-11 items-center text-sm text-ink"
            >
              Create account
            </Link>
            <Link
              href="/demo"
              className="marketing-btn-primary inline-flex min-h-11 items-center justify-center rounded-[9px] px-4 text-sm font-semibold"
            >
              Book a demo
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
