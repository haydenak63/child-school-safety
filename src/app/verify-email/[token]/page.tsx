import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/components/auth/auth-frame";
import { consumeEmailVerification } from "@/lib/auth/email-tokens";
import { AppError } from "@/lib/errors";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let result: { state: "ok" | "invalid" | "expired" | "used"; alreadyVerified: boolean };
  try {
    result = await consumeEmailVerification(token);
  } catch (error) {
    const message =
      error instanceof AppError
        ? error.message
        : "We could not verify this link. Sign in and request a new verification email.";
    return (
      <AuthFrame panelBody="Request a new verification email if you still need to activate your account.">
        <p className="eyebrow mt-4 lg:mt-0">Email confirmation</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Verification is unavailable</h2>
        <p className="mt-2 text-sm text-ink-muted">{message}</p>
        <Link
          href="/login?unverified=1"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Back to sign in
        </Link>
      </AuthFrame>
    );
  }

  if (result.state === "ok") {
    return (
      <AuthFrame panelBody="Your school account is ready. Sign in to start recording attendance.">
        <p className="eyebrow mt-4 lg:mt-0">Email confirmed</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {result.alreadyVerified ? "This email is already verified." : "Your email is verified."}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">You can now sign in to CSS with your school account.</p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </AuthFrame>
    );
  }

  const copy =
    result.state === "used"
      ? {
          title: "This verification link has already been used.",
          body: "If you can already sign in, continue there. Otherwise request a new link from the sign-in page.",
        }
      : result.state === "expired"
        ? {
            title: "This verification link has expired.",
            body: "Verification links expire after 48 hours. Request a new one from the sign-in page.",
          }
        : {
            title: "This verification link is invalid.",
            body: "Ask for a new verification email from the sign-in page.",
          };

  return (
    <AuthFrame panelBody="Request a new verification email if you still need to activate your account.">
      <p className="eyebrow mt-4 lg:mt-0">Email confirmation</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{copy.title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{copy.body}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/login"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Sign in
        </Link>
        <Link
          href="/login?unverified=1"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-line-strong bg-surface text-sm font-semibold text-ink"
        >
          Resend verification
        </Link>
      </div>
    </AuthFrame>
  );
}
