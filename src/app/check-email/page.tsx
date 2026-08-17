import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/components/auth/auth-frame";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

function copyFor(reason: string | undefined, mail: string | undefined) {
  if (reason === "register" && mail === "skipped") {
    return {
      title: "Account created",
      body: "Your school account was created, but outbound email is not configured yet so we could not send a verification link. Ask the platform operator to enable SMTP, then request a new verification email from the sign-in page.",
    };
  }
  if (reason === "register" && mail === "failed") {
    return {
      title: "Account created",
      body: "Your school account was created, but the verification email could not be sent. Try requesting a new link from the sign-in page in a few minutes.",
    };
  }
  if (reason === "register") {
    return {
      title: "Check your inbox",
      body: "We sent a verification link to your email. Open it within 48 hours to activate your school account.",
    };
  }
  if (reason === "forgot") {
    return {
      title: "Check your inbox",
      body: "If an account exists for that email, we sent a reset link. It expires in one hour.",
    };
  }
  if (reason === "resend") {
    return {
      title: "Check your inbox",
      body: "If that account still needs verification, we sent a new link. It expires in 48 hours.",
    };
  }
  return {
    title: "Check your inbox",
    body: "If we need anything from you, the next step is in your email.",
  };
}

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; mail?: string }>;
}) {
  const params = await searchParams;
  const copy = copyFor(params.reason, params.mail);

  return (
    <AuthFrame panelBody="Open the message from CSS to continue.">
      <p className="eyebrow mt-4 lg:mt-0">Email sent</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{copy.body}</p>
      <Link
        href="/login"
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
      >
        Back to sign in
      </Link>
    </AuthFrame>
  );
}
