import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/primitives";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { Reveal } from "@/components/marketing/reveal";
import { ProductPreview } from "@/components/marketing/product-preview";

export const metadata: Metadata = {
  title: "Safer school arrivals",
  description: site.description,
  alternates: { canonical: "/" },
};

const steps = [
  {
    n: "01",
    title: "Enroll",
    body: "A student profile is created and a biometric identity is securely enrolled.",
  },
  {
    n: "02",
    title: "Scan",
    body: "The student checks in using the designated school terminal.",
  },
  {
    n: "03",
    title: "Verify",
    body: "The system identifies the student and records arrival or departure.",
  },
  {
    n: "04",
    title: "Notify",
    body: "Attendance is stored and the parent notification workflow is triggered.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <p className="eyebrow">School child safety</p>
            <h1 className="mt-4 max-w-xl text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Every arrival.
              <br />
              Every departure.
              <br />
              Every child accounted for.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-muted sm:text-lg">
              Know when every student arrives, leaves, and gets home — with a secure attendance
              experience built for modern schools.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/demo" className="min-h-12 px-6">
                Book a demo
              </Button>
              <Button href="/features" variant="secondary" className="min-h-12 px-6">
                Explore platform
              </Button>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-center text-sm text-ink-muted">Built for safer school operations</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Student safety", "Real-time attendance", "Parent notifications", "Secure infrastructure"].map(
              (item) => (
                <p
                  key={item}
                  className="rounded-2xl border border-line bg-canvas px-4 py-4 text-center text-sm font-medium"
                >
                  {item}
                </p>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <p className="eyebrow">The problem</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            School entry shouldn’t be a blind spot.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-[24px] border border-line bg-surface p-6">
              <p className="eyebrow">Before</p>
              <ol className="mt-5 space-y-4 text-sm text-ink-soft">
                <li>Student arrives.</li>
                <li>Staff manually records attendance.</li>
                <li>Parents wait.</li>
                <li>Information gets delayed.</li>
              </ol>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-[24px] border border-line bg-brand p-6 text-white">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/60">AFTER</p>
              <ol className="mt-5 space-y-4 text-sm text-white/90">
                <li>Student arrives.</li>
                <li>The terminal identifies the student.</li>
                <li>Attendance is recorded.</li>
                <li>The parent is notified.</li>
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Four steps from gate to home.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.n} delay={index * 70}>
                <article className="h-full rounded-[24px] border border-line bg-canvas p-5">
                  <p className="font-mono text-sm text-accent">{step.n}</p>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <p className="eyebrow">Product</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Built for operators, not spreadsheets.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
            A calm dashboard for arrivals, departures, students, terminals, and recent activity.
          </p>
        </Reveal>
        <div className="mt-10">
          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <p className="eyebrow">Trust</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Built around trust.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
              Halo uses authenticated admin access, one-time enrollment sessions, expiring tokens,
              and protected biometric templates. Camera matching in this prototype is not a
              production-grade biometric system.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Secure authentication",
              "One-time enrollment sessions",
              "Expiring tokens",
              "Terminal authentication",
              "Protected biometric templates",
              "Modular biometric architecture",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-line bg-canvas px-4 py-5 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
          <Link href="/security" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-brand">
            Read the security model
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <Reveal>
          <p className="eyebrow">Parents</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Parents know when it matters.</h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Student enters school. The system records arrival. A parent notification is generated.
            This prototype uses a mock WhatsApp provider — no live messaging API is connected.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div className="rounded-[24px] border border-line bg-surface p-6 halo-shadow">
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted">SCHOOL ARRIVAL ALERT</p>
            <p className="mt-3 text-lg font-semibold">Ali Ahmed has arrived at ABC International School.</p>
            <p className="mt-3 text-sm text-ink-muted">08:42 AM · Main Entrance</p>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <p className="eyebrow">Terminal</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Built for repetitive gate use.</h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              Full-screen. Large type. High contrast. After each result, the terminal returns to
              ready for the next scan.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-[28px] bg-ink p-8 text-center text-white">
              <p className="text-xs tracking-[0.2em] text-white/50">MAIN ENTRANCE</p>
              <p className="mt-3 text-sm font-semibold text-teal-200">● READY</p>
              <p className="mt-6 text-lg">Place your finger in front of the camera.</p>
              <div className="mx-auto mt-8 h-40 w-28 rounded-[40%] border border-white/30" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Give families greater visibility.</h2>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              See how Halo records arrivals and departures without turning the school gate into a
              spreadsheet.
            </p>
          </div>
          <Button href="/demo" className="bg-white text-brand hover:bg-white/90">
            Book a demo
          </Button>
        </div>
      </section>
    </>
  );
}
