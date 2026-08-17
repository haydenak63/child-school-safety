import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/components/auth/auth-frame";
import { fieldClass } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Create a school account",
  description: "Register your school on CSS to record arrivals, departures, and parent notifications.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthFrame
      panelBody="Create a school account to enroll students, set up gate terminals, and notify parents."
    >
      <form method="post" action="/api/auth/register">
        <p className="eyebrow mt-4 lg:mt-0">New school</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create a school account</h2>
        <p className="mt-2 text-sm text-ink-muted">
          You will confirm your email before signing in.
        </p>
        <label className="mt-8 block text-sm font-medium text-ink-soft">
          School name
          <input name="schoolName" className={`${fieldClass} mt-1.5`} required maxLength={160} />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Your name
          <input name="ownerName" className={`${fieldClass} mt-1.5`} required maxLength={120} autoComplete="name" />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Email
          <input type="email" name="email" className={`${fieldClass} mt-1.5`} required autoComplete="email" />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-soft">
          School address
          <input name="address" className={`${fieldClass} mt-1.5`} maxLength={240} placeholder="Street, city" />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Timezone
          <input name="timezone" defaultValue="Asia/Karachi" className={`${fieldClass} mt-1.5`} required />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Password
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
          Create account
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:text-brand-2">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
