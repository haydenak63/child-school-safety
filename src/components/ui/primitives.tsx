import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-brand !text-white hover:bg-brand-2 disabled:opacity-50",
  secondary:
    "border border-line-strong bg-surface text-ink hover:bg-canvas disabled:opacity-50",
  ghost: "text-ink-soft hover:bg-canvas disabled:opacity-50",
  danger: "bg-danger text-white hover:opacity-90 disabled:opacity-50",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
}) {
  const cls = `inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors duration-150 ${styles[variant]} ${className}`;
  if (href) {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return (
        <a href={href} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-ink-soft">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const fieldClass =
  "min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-ink outline-none transition-[box-shadow,border-color] duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15";

export function Card({
  children,
  className = "",
  radius = "default",
}: {
  children: ReactNode;
  className?: string;
  // "tight" is a 16px corner for dense, data-heavy panels on small screens,
  // where the 20px default reads as oversized.
  radius?: "default" | "tight";
}) {
  const corner = radius === "tight" ? "rounded-2xl" : "rounded-[var(--radius)]";
  return (
    <div className={`${corner} border border-line bg-surface halo-shadow ${className}`}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "brand";
}) {
  const tones = {
    neutral: "bg-canvas text-ink-soft",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    danger: "bg-danger-soft text-danger",
    brand: "bg-[#eef3f8] text-brand",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef3f8] text-sm font-semibold text-brand">
      {initials}
    </span>
  );
}
