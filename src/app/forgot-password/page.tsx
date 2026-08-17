import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/components/auth/auth-frame";
import { fieldClass } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a CSS password reset link.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthFrame panelBody="We’ll email a one-hour link if an account exists for that address.">
      <form method="post" action="/api/auth/forgot">
        <p className="eyebrow mt-4 lg:mt-0">Account recovery</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Forgot your password?</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Enter the email on your school account. If it exists, we will send a reset link.
        </p>
        <label className="mt-8 block text-sm font-medium text-ink-soft">
          Email
          <input type="email" name="email" className={`${fieldClass} mt-1.5`} required autoComplete="email" />
        </label>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Send reset link
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        <Link href="/login" className="font-medium text-brand hover:text-brand-2">
          Back to sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
