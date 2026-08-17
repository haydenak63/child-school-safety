import type { Metadata } from "next";
import { DemoBanner } from "@/components/demo-banner";
import { Logo } from "@/components/brand/logo";
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
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const error = params.error;

  return (
    <div className="min-h-screen bg-canvas">
      <DemoBanner />
      <div className="grid min-h-[calc(100vh-36px)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-brand px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
          <Logo className="text-white [&>span:last-child]:text-white" />
          <div className="max-w-md">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/60">SCHOOL ATTENDANCE</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Every arrival.
              <br />
              Every departure.
              <br />
              Accounted for.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Sign in to manage students, enrollment, terminals, and parent notifications.
            </p>
          </div>
          <p className="text-xs text-white/50">Camera fingerprint matching is a prototype.</p>
        </section>

        <section className="flex items-center justify-center px-4 py-12">
          <form method="post" action="/api/auth/login" className="w-full max-w-md rounded-[24px] border border-line bg-surface p-6 halo-shadow sm:p-8">
            <div className="lg:hidden">
              <Logo />
            </div>
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
                defaultValue="admin@abcschool.test"
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
            {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
            <button
              type="submit"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
            >
              Sign in
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
