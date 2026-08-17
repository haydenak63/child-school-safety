import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/components/auth/auth-frame";
import { fieldClass } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Halo school attendance portal.",
  robots: { index: false, follow: false },
};

function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    notice?: string;
    unverified?: string;
    email?: string;
  }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const error = params.error;
  const notice = params.notice;
  const unverified = params.unverified === "1";
  const email = params.email ?? "";

  return (
    <AuthFrame>
      <form method="post" action="/api/auth/login">
        <p className="eyebrow mt-4 lg:mt-0">Admin access</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Sign in to Halo</h2>
        <p className="mt-2 text-sm text-ink-muted">Use your school administrator account.</p>
        <input type="hidden" name="next" value={next} />
        <label className="mt-8 block text-sm font-medium text-ink-soft">
          Email
          <input
            type="email"
            name="email"
            autoComplete="username"
            defaultValue={email}
            className={`${fieldClass} mt-1.5`}
            required
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className={`${fieldClass} mt-1.5`}
            required
          />
        </label>
        {notice ? <p className="mt-4 text-sm text-ok">{notice}</p> : null}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Sign in
        </button>
      </form>
      {unverified ? (
        <form method="post" action="/api/auth/resend-verification" className="mt-4 rounded-xl border border-line bg-canvas p-4">
          <p className="text-sm text-ink-soft">Need a new verification link?</p>
          {email ? (
            <input type="hidden" name="email" value={email} />
          ) : (
            <label className="mt-3 block text-sm font-medium text-ink-soft">
              Email
              <input type="email" name="email" className={`${fieldClass} mt-1.5`} required />
            </label>
          )}
          <button
            type="submit"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-line-strong bg-surface text-sm font-semibold text-ink"
          >
            Resend verification email
          </button>
        </form>
      ) : null}
      <div className="mt-6 flex flex-col gap-2 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <Link href="/forgot-password" className="min-h-11 inline-flex items-center hover:text-ink">
          Forgot password
        </Link>
        <Link href="/register" className="min-h-11 inline-flex items-center font-medium text-brand hover:text-brand-2">
          Create a school account
        </Link>
      </div>
    </AuthFrame>
  );
}
