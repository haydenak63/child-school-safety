import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Features",
  description: "Attendance, enrollment, terminals, and parent notifications in one school platform.",
  alternates: { canonical: "/features" },
};

const features = [
  {
    title: "Smart attendance",
    body: "Record arrivals and departures as students are identified at school terminals.",
  },
  {
    title: "Student management",
    body: "Create student profiles, classes, sections, and parent associations in one place.",
  },
  {
    title: "Parent notifications",
    body: "Generate arrival and departure messages through the notification workflow.",
  },
  {
    title: "Terminal management",
    body: "Issue, revoke, and reopen gate terminals from the admin portal.",
  },
  {
    title: "Secure enrollment",
    body: "Share a one-time, expiring enrollment link for mobile fingerprint capture.",
  },
  {
    title: "Real-time activity",
    body: "See recent scans, confidence, and terminal status as events come in.",
  },
  {
    title: "Responsive administration",
    body: "Use the same product on a desktop office computer or a phone in the school office.",
  },
  {
    title: "Modular biometrics",
    body: "Matching runs behind a provider interface, so dedicated hardware can replace the camera later.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <Reveal>
        <p className="eyebrow">Platform</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">Everything the school gate needs.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted">
          Halo covers enrollment, identification, attendance, and parent notification — without
          turning operations into a maze of screens.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 40}>
            <article className="h-full rounded-[24px] border border-line bg-surface p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:border-line-strong">
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{feature.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
