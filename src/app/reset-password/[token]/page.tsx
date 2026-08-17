import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/components/auth/auth-frame";
import { fieldClass } from "@/components/ui/primitives";
import { lookupResetToken } from "@/lib/auth/email-tokens";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const state = await lookupResetToken(token);

  if (state !== "ok") {
    const title =
      state === "used" ? "This reset link has already been used." : "This reset link is invalid or has expired.";
    return (
      <AuthFrame panelBody="Request a new password reset from the sign-in page.">
        <p className="eyebrow mt-4 lg:mt-0">Account recovery</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-ink-muted">Password reset links expire after one hour and can be used only once.</p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Request a new link
        </Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame panelBody="Choose a new password for your school account.">
      <form method="post" action="/api/auth/reset">
        <p className="eyebrow mt-4 lg:mt-0">Account recovery</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Choose a new password</h2>
        <p className="mt-2 text-sm text-ink-muted">Use at least 8 characters.</p>
        <input type="hidden" name="token" value={token} />
        <label className="mt-8 block text-sm font-medium text-ink-soft">
          New password
          <input
            type="password"
            name="password"
            minLength={8}
            className={`${fieldClass} mt-1.5`}
            required
            autoComplete="new-password"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            minLength={8}
            className={`${fieldClass} mt-1.5`}
            required
            autoComplete="new-password"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Update password
        </button>
      </form>
    </AuthFrame>
  );
}
