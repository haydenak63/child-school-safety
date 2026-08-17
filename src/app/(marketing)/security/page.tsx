import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Security",
  description: "How CSS protects enrollment sessions, terminals, and biometric templates.",
  alternates: { canonical: "/security" },
};

const items = [
  {
    title: "Authentication",
    body: "Admin pages require a signed session. Terminals authenticate with a unique token.",
  },
  {
    title: "Enrollment sessions",
    body: "Enrollment links are one-time, hashed at rest, and expire after a short window.",
  },
  {
    title: "Token expiry",
    body: "QR enrollment sessions time out so unused links cannot stay open indefinitely.",
  },
  {
    title: "Terminal access",
    body: "A revoked terminal cannot record attendance, even if someone still has an old URL.",
  },
  {
    title: "Biometric abstraction",
    body: "Matching runs through a provider interface so camera capture can later be replaced by hardware.",
  },
  {
    title: "Data protection",
    body: "Fingerprint templates are stored as protected data and are never shown in the interface.",
  },
  {
    title: "Notifications",
    body: "Every parent message is recorded, so schools keep an auditable history of what was sent and when.",
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      <Reveal>
        <p className="eyebrow">Security</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Built around trust.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted">
          CSS is designed with controlled access, short-lived enrollment, and biometric templates
          that never leave protected storage.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-4">
        {items.map((item) => (
          <article key={item.title} className="rounded-[24px] border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
