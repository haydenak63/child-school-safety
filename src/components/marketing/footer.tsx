import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/security", label: "Security" },
      { href: "/demo", label: "Book a demo" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-line pt-16 pb-10">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-10 px-5 sm:px-8 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-[240px] text-[13px] leading-7 text-ink-muted">
            Know when students arrive. Know when they leave. Keep parents informed.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="font-[family-name:var(--font-plex)] text-[11px] font-medium tracking-[0.1em] text-ink-muted uppercase">
              {column.title}
            </p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13.5px] text-ink-muted hover:text-[#4b2fcb]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-[1180px] flex-col gap-2 border-t border-line px-5 pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} CSS. School attendance and child safety.</p>
        <p>Camera fingerprint matching is a practical school gate matcher, not a production AFIS.</p>
      </div>
    </footer>
  );
}
