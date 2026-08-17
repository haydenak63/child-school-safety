import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "How it works",
  description: "From student enrollment to parent notification, the Halo attendance journey.",
  alternates: { canonical: "/how-it-works" },
};

const journey = [
  "School creates a student.",
  "Parent information is added.",
  "A secure enrollment link is generated.",
  "A phone scans the QR code.",
  "The fingerprint is captured.",
  "The student is enrolled.",
  "The student arrives at school.",
  "The terminal identifies the student.",
  "Attendance is recorded.",
  "A parent notification is generated.",
  "The terminal resets for the next scan.",
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <Reveal>
        <p className="eyebrow">Journey</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">From enrollment to the school gate.</h1>
        <p className="mt-4 text-sm leading-6 text-ink-muted">
          Halo is designed as a repeating operational loop. The terminal stays open and returns to
          ready after each result.
        </p>
      </Reveal>
      <ol className="mt-12 space-y-3">
        {journey.map((step, index) => (
          <Reveal key={step} delay={index * 30}>
            <li className="flex gap-4 rounded-2xl border border-line bg-surface px-4 py-4">
              <span className="w-8 shrink-0 font-mono text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium">{step}</span>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
