import type { Metadata } from "next";
import { LegalNav } from "@/components/marketing/legal-nav";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the Halo school attendance platform.",
  alternates: { canonical: "/terms" },
};

const sections = [
  { id: "use", label: "Use of the service" },
  { id: "biometrics", label: "Biometric limits" },
  { id: "accounts", label: "Accounts" },
  { id: "liability", label: "Liability" },
];

export default function TermsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-24">
      <LegalNav items={sections} />
      <article className="max-w-2xl space-y-10 text-sm leading-7 text-ink-soft">
        <div>
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Terms of service</h1>
          <p className="mt-3">These terms apply to schools and administrators using Halo.</p>
        </div>
        <section id="use">
          <h2 className="text-xl font-semibold text-ink">Use of the service</h2>
          <p className="mt-3">
            Halo supports school attendance workflows: enrollment, gate terminals, attendance
            records, and parent notifications. Schools remain responsible for their own gate
            supervision procedures.
          </p>
        </section>
        <section id="biometrics">
          <h2 className="text-xl font-semibold text-ink">Biometric limits</h2>
          <p className="mt-3">
            Camera fingerprint matching can fail, mismatch, or be affected by lighting and image
            quality. Do not rely on it as the only child-safety control.
          </p>
        </section>
        <section id="accounts">
          <h2 className="text-xl font-semibold text-ink">Accounts</h2>
          <p className="mt-3">
            Administrators are responsible for protecting sign-in credentials, enrollment QR codes,
            and terminal URLs.
          </p>
        </section>
        <section id="liability">
          <h2 className="text-xl font-semibold text-ink">Liability</h2>
          <p className="mt-3">
            Halo is provided as-is. No warranty is made that identification, attendance, or
            notifications will be complete or uninterrupted.
          </p>
        </section>
      </article>
    </div>
  );
}
