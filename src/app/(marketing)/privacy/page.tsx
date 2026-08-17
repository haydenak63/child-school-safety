import type { Metadata } from "next";
import { LegalNav } from "@/components/marketing/legal-nav";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the Halo prototype handles school, student, and biometric data.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  { id: "scope", label: "Scope" },
  { id: "data", label: "Data we process" },
  { id: "biometrics", label: "Biometrics" },
  { id: "notifications", label: "Notifications" },
  { id: "retention", label: "Retention" },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-24">
      <LegalNav items={sections} />
      <article className="max-w-2xl space-y-10 text-sm leading-7 text-ink-soft">
        <div>
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Privacy policy</h1>
          <p className="mt-3">This document describes the Halo prototype. It is not a certified privacy program.</p>
        </div>
        <section id="scope">
          <h2 className="text-xl font-semibold text-ink">Scope</h2>
          <p className="mt-3">
            Halo is a school attendance prototype. It processes administrator accounts, student and
            parent records, attendance events, and camera-captured fingerprint images used to create
            protected templates.
          </p>
        </section>
        <section id="data">
          <h2 className="text-xl font-semibold text-ink">Data we process</h2>
          <p className="mt-3">
            School profile information, student names and class details, parent names and WhatsApp
            numbers, terminal metadata, and attendance timestamps. Demo contact requests are stored
            in memory on the server and are not emailed to a public inbox.
          </p>
        </section>
        <section id="biometrics">
          <h2 className="text-xl font-semibold text-ink">Biometrics</h2>
          <p className="mt-3">
            Fingerprint capture uses the device camera. Matching is a prototype comparison, not a
            production biometric security system. Templates are stored in protected form and are
            never displayed in the interface.
          </p>
        </section>
        <section id="notifications">
          <h2 className="text-xl font-semibold text-ink">Notifications</h2>
          <p className="mt-3">
            Parent messages are generated through a mock WhatsApp provider. They are logged for
            demonstration and are not sent over a live messaging network.
          </p>
        </section>
        <section id="retention">
          <h2 className="text-xl font-semibold text-ink">Retention</h2>
          <p className="mt-3">
            Data remains in the school’s database until an administrator removes or deactivates the
            related records. This prototype does not offer automated cross-border transfer controls
            or third-party certifications.
          </p>
        </section>
      </article>
    </div>
  );
}
