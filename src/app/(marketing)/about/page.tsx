import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Halo is a school attendance and child-safety platform for arrivals and departures.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="eyebrow">About</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">A quieter way to run the school gate.</h1>
      <div className="mt-8 space-y-5 text-sm leading-7 text-ink-soft">
        <p>
          Halo helps schools know when students arrive and leave, then keep parents informed. It is
          built for operators who need a serious product, not a cluttered administration template.
        </p>
        <p>
          The current system is a working prototype: students, parents, enrollment, camera
          fingerprint matching, attendance terminals, and mock parent notifications. Dedicated
          biometric hardware can replace the camera provider later without changing the rest of the
          product.
        </p>
        <p>
          We do not use fear-based language. The goal is simple: give schools and families greater
          visibility from the moment students arrive.
        </p>
      </div>
    </div>
  );
}
