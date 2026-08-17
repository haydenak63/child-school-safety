import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Safer school arrivals",
  description: site.description,
  alternates: { canonical: "/" },
};

const pills = [
  "Student safety",
  "Real-time attendance",
  "Parent notifications",
  "Secure infrastructure",
  "Terminal-based entry",
  "Encrypted templates",
];

const trust = [
  { title: "Secure authentication", body: "Every admin session is authenticated and scoped to a role." },
  { title: "One-time enrollment sessions", body: "Enrollment links expire after a single use." },
  { title: "Expiring tokens", body: "Terminal and API tokens rotate on a fixed schedule." },
  { title: "Terminal authentication", body: "Each terminal is paired and verified before it can log activity." },
  { title: "Protected biometric templates", body: "Biometric data is stored as encrypted templates, never raw images." },
  { title: "Modular biometric architecture", body: "The matching engine is swappable as verification methods evolve." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-28">
        <div className="pointer-events-none absolute -top-[220px] -right-[180px] h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(108,92,231,0.16),transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-[260px] -left-[200px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(255,165,62,0.14),transparent_65%)]" />
        <div className="hero-grid-fade pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">School child safety</p>
            <h1 className="mt-4 text-[clamp(38px,5vw,60px)] font-bold">
              Every arrival.
              <br />
              Every departure.
              <br />
              <span className="bg-gradient-to-br from-[#6c5ce7] to-[#2f5bff] bg-clip-text text-transparent">
                Every child accounted for.
              </span>
            </h1>
            <p className="mt-6 max-w-[460px] text-[17px] leading-7 text-ink-muted">
              Know when every student arrives, leaves, and gets home — with a secure attendance
              system built for the realities of a school gate.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="marketing-btn-primary inline-flex min-h-12 items-center justify-center rounded-[9px] px-5 text-[13.5px] font-semibold"
              >
                Book a demo
              </Link>
              <Link
                href="/features"
                className="inline-flex min-h-12 items-center justify-center rounded-[9px] border border-line-strong px-5 text-[13.5px] font-semibold text-ink hover:bg-[#f8f7fc]"
              >
                Explore platform
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -right-3 z-10 hidden items-center gap-2.5 rounded-xl border border-line-strong bg-white px-3.5 py-3 shadow-[0_20px_40px_-14px_rgba(20,20,43,0.3)] sm:flex">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[rgba(108,92,231,0.1)] text-[#4b2fcb]">
                ✓
              </span>
              <span>
                <b className="block text-[12.5px]">Verified at gate</b>
                <span className="font-[family-name:var(--font-plex)] text-[10.5px] text-ink-muted">112ms match</span>
              </span>
            </div>
            <div className="rounded-[18px] border border-line bg-white p-[22px] shadow-[0_30px_70px_-30px_rgba(20,20,43,0.28)]">
              <div className="mb-[18px] flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-muted">Main entrance</p>
                  <p className="mt-0.5 text-sm font-semibold">ABC International School</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(108,92,231,0.1)] px-2.5 py-1 font-[family-name:var(--font-plex)] text-[11px] text-[#4b2fcb]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6c5ce7]" />
                  Live
                </span>
              </div>
              <div className="flex items-center justify-center py-7">
                <div className="scan-ripple relative flex h-[150px] w-[150px] items-center justify-center rounded-full border border-line-strong">
                  <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[rgba(108,92,231,0.45)] bg-[radial-gradient(circle_at_35%_30%,rgba(108,92,231,0.22),rgba(108,92,231,0.04))] text-[#4b2fcb]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 11c1.66 0 3-1.34 3-3V6a3 3 0 0 0-6 0v2c0 1.66 1.34 3 3 3z" />
                      <path d="M19 11v1a7 7 0 0 1-14 0v-1M12 19v3" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="border-t border-line">
                {[
                  ["Ali Ahmed", "Main entrance · 08:42", "Arrived", true],
                  ["Sara Khan", "Main entrance · 08:45", "Arrived", true],
                  ["Notification sent", "To Ali Ahmed's parent · 08:42", "Sent", false],
                ].map(([name, meta, status, arrived]) => (
                  <div key={String(name)} className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
                    <div>
                      <p className="text-[13.5px] font-medium">{name}</p>
                      <p className="mt-0.5 font-[family-name:var(--font-plex)] text-[11.5px] text-ink-muted">{meta}</p>
                    </div>
                    <span
                      className={`rounded-md px-2.5 py-1 font-[family-name:var(--font-plex)] text-[11px] ${
                        arrived
                          ? "bg-[rgba(108,92,231,0.1)] text-[#4b2fcb]"
                          : "bg-[rgba(255,165,62,0.12)] text-[#c17416]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-line bg-[#f8f7fc] py-6">
        <div className="marketing-marquee">
          {[...pills, ...pills].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-[18px] py-2 font-[family-name:var(--font-plex)] text-[12.5px] text-ink-muted"
            >
              <span className="text-[8px] text-[#6c5ce7]">○</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <section id="features" className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8">
        <Reveal>
          <p className="eyebrow">The problem</p>
          <h2 className="mt-3 max-w-[600px] text-[clamp(28px,3.4vw,42px)] font-bold">
            School entry shouldn&apos;t be a blind spot.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="rounded-[14px] border border-line bg-[#f8f7fc] p-8">
              <p className="font-[family-name:var(--font-plex)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
                Before CSS
              </p>
              <ol className="mt-5">
                {["Student arrives at the gate.", "Staff manually records attendance.", "Parents wait for word.", "Information gets delayed, or lost."].map(
                  (step, index) => (
                    <li key={step} className="flex items-baseline gap-3 border-b border-line py-3 text-[15px] last:border-b-0">
                      <span className="font-[family-name:var(--font-plex)] text-[11px] text-ink-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step}
                    </li>
                  ),
                )}
              </ol>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-[14px] border border-[rgba(108,92,231,0.3)] bg-gradient-to-br from-[#f2effe] to-[#fdf3ec] p-8">
              <p className="font-[family-name:var(--font-plex)] text-[11px] tracking-[0.12em] text-[#4b2fcb] uppercase">
                With CSS
              </p>
              <ol className="mt-5">
                {["Student checks in at the terminal.", "The terminal identifies the student.", "Attendance is recorded instantly.", "The parent is notified in seconds."].map(
                  (step, index) => (
                    <li key={step} className="flex items-baseline gap-3 border-b border-[rgba(20,20,43,0.06)] py-3 text-[15px] last:border-b-0">
                      <span className="font-[family-name:var(--font-plex)] text-[11px] text-[#4b2fcb]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step}
                    </li>
                  ),
                )}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-28 sm:px-8">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-[clamp(28px,3.4vw,42px)] font-bold">Four steps from gate to home.</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["01", "Enroll", "A student profile is created and a biometric identity is securely registered once."],
            ["02", "Scan", "The student checks in at the designated school terminal — no card, no queue."],
            ["03", "Verify", "The system confirms the student's identity and logs arrival or departure."],
            ["04", "Notify", "Attendance is stored and the parent notification is triggered automatically."],
          ].map(([n, title, body], index) => (
            <Reveal key={n} delay={index * 70}>
              <article>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-white font-[family-name:var(--font-plex)] text-[13px] text-[#4b2fcb] shadow-[0_6px_16px_-8px_rgba(20,20,43,0.18)]">
                  {n}
                </div>
                <h3 className="text-[17px] font-semibold">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-6 text-ink-muted">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#f8f7fc] py-28">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <Reveal>
            <p className="eyebrow">Product</p>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,42px)] font-bold">Built for operators, not spreadsheets.</h2>
            <p className="mt-3.5 max-w-2xl text-[15.5px] leading-7 text-ink-muted">
              A calm dashboard for arrivals, departures, students, terminals, and recent activity —
              updated the moment it happens.
            </p>
          </Reveal>
          <div className="mt-12 overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_40px_90px_-40px_rgba(20,20,43,0.3)]">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e3e1f2]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e3e1f2]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e3e1f2]" />
              <p className="ml-2 font-[family-name:var(--font-plex)] text-[11.5px] text-ink-muted">css.iqpigeon.com/dashboard</p>
            </div>
            <div className="grid gap-3.5 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Students", "48", "from-[#7b5cfa] to-[#5535d6]"],
                ["Parents", "46", "from-[#ff6b6b] to-[#e63946]"],
                ["Arrivals", "31", "from-[#4d7cff] to-[#2044d6]"],
                ["Departures", "12", "from-[#ffb663] to-[#f2891a]"],
              ].map(([label, value, tone]) => (
                <div key={label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${tone} p-5 text-white`}>
                  <p className="font-[family-name:var(--font-plex)] text-[10.5px] tracking-[0.08em] uppercase opacity-85">
                    {label}
                  </p>
                  <p className="mt-3 text-[26px] font-bold">{value}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <p className="font-[family-name:var(--font-plex)] text-[11px] tracking-[0.08em] text-ink-muted uppercase">
                Recent activity
              </p>
              {[
                ["Ali Ahmed", "08:42 AM · Main entrance", "Arrived"],
                ["Sara Khan", "08:45 AM · Main entrance", "Arrived"],
                ["Ali Ahmed", "02:17 PM · Main exit", "Departed"],
              ].map((row) => (
                <div key={row.join()} className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{row[0]}</p>
                    <p className="mt-0.5 font-[family-name:var(--font-plex)] text-[11.5px] text-ink-muted">{row[1]}</p>
                  </div>
                  <span
                    className={`rounded-md px-2.5 py-1 font-[family-name:var(--font-plex)] text-[11px] ${
                      row[2] === "Arrived"
                        ? "bg-[rgba(108,92,231,0.1)] text-[#4b2fcb]"
                        : "bg-[rgba(255,165,62,0.12)] text-[#c17416]"
                    }`}
                  >
                    {row[2]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-[1180px] px-5 py-28 sm:px-8">
        <Reveal>
          <p className="eyebrow">Trust</p>
          <h2 className="mt-3 text-[clamp(28px,3.4vw,42px)] font-bold">Built around trust.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trust.map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) * 70}>
              <article className="rounded-[14px] border border-line bg-white p-6 hover:border-[rgba(108,92,231,0.35)] hover:shadow-[0_20px_40px_-24px_rgba(20,20,43,0.3)]">
                <h4 className="text-[14.5px] font-semibold">{item.title}</h4>
                <p className="mt-1.5 text-[12.5px] leading-5 text-ink-muted">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 max-w-[600px] text-[12.5px] leading-6 text-ink-muted">
          CSS uses authenticated admin access, one-time enrollment sessions, expiring tokens, and
          protected biometric templates.
        </p>
        <Link href="/security" className="mt-5 inline-flex min-h-11 items-center text-[13.5px] font-medium text-[#4b2fcb]">
          Read the security model →
        </Link>
      </section>

      <section className="bg-[#f8f7fc] py-24">
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="eyebrow">Parents</p>
            <h2 className="mt-3 text-[clamp(26px,3vw,36px)] font-bold">Parents know when it matters.</h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-7 text-ink-muted">
              Student enters school. The system records arrival. A parent notification is generated
              automatically — no staff message, no delay.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="ml-auto max-w-[320px] rounded-[26px] border border-line bg-white p-5 shadow-[0_40px_90px_-34px_rgba(20,20,43,0.32)]">
              <div className="mx-auto mb-5 h-1.5 w-[70px] rounded-full bg-line-strong" />
              <div className="rounded-[14px] border border-line-strong bg-[#f8f7fc] p-4">
                <p className="font-[family-name:var(--font-plex)] text-[11px] tracking-[0.06em] text-ink-muted uppercase">
                  School arrival alert
                </p>
                <p className="mt-2 text-[13.5px] font-semibold">
                  Ali Ahmed has arrived at ABC International School.
                </p>
                <p className="mt-1 text-xs text-ink-muted">08:42 AM · Main entrance</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8">
        <div className="overflow-hidden rounded-[22px] bg-[#14142b] shadow-[0_50px_100px_-44px_rgba(20,20,43,0.5)] lg:grid lg:grid-cols-2">
          <div className="p-10 text-white sm:p-[52px]">
            <p className="eyebrow eyebrow-dark">Terminal</p>
            <h3 className="mt-3 text-[26px] font-bold">Built for repetitive gate use.</h3>
            <p className="mt-3.5 max-w-[380px] text-[14.5px] leading-7 text-white/60">
              Full-screen. Large type. High contrast. After each result, the terminal returns to
              ready for the next scan — hundreds of times a morning, without a second thought.
            </p>
          </div>
          <div className="flex min-h-[320px] flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#241f4a,#14142b_75%)] px-8 py-16">
            <p className="mb-5 flex items-center gap-2 font-[family-name:var(--font-plex)] text-[11.5px] tracking-[0.1em] text-[#b7aaff] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b7aaff]" />
              Ready
            </p>
            <p className="mb-8 text-center font-[family-name:var(--font-plex)] text-base text-white">
              Place your finger in front of the camera.
            </p>
            <div className="finger-scan relative h-[150px] w-[120px] rounded-[60px_60px_50px_50px] border-[1.5px] border-[rgba(183,170,255,0.55)]" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-5 pb-10 sm:px-8">
        <div className="marketing-cta flex flex-col items-start justify-between gap-8 rounded-[22px] p-10 text-white sm:p-14 lg:flex-row lg:items-center">
          <div>
            <h3 className="max-w-[480px] text-2xl font-bold">Give families greater visibility.</h3>
            <p className="mt-2.5 max-w-[440px] text-[14.5px] leading-6 text-white/75">
              See how CSS records arrivals and departures without turning the school gate into a
              spreadsheet.
            </p>
          </div>
          <Link
            href="/demo"
            className="inline-flex min-h-11 items-center rounded-[9px] bg-white px-5 text-[13.5px] font-semibold text-[#14142b]"
          >
            Book a demo
          </Link>
        </div>
      </div>
    </>
  );
}
