export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="hero-float rounded-[28px] border border-line bg-surface p-4 halo-shadow sm:p-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <p className="eyebrow">Main entrance</p>
            <p className="mt-1 text-sm font-semibold">ABC International School</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-semibold text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-ring" />
            Live
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <EventCard
            name="Ali Ahmed"
            status="ARRIVED"
            place="Main Entrance"
            time="08:42"
            delay="0ms"
          />
          <EventCard
            name="Sara Khan"
            status="ARRIVED"
            place="Main Entrance"
            time="08:45"
            delay="180ms"
          />
        </div>

        <div
          className="mt-4 rounded-2xl border border-line bg-canvas p-4 animate-fade-up"
          style={{ animationDelay: "420ms" }}
        >
          <p className="text-xs font-semibold text-ink-muted">Parent notification</p>
          <p className="mt-1 text-sm font-medium">Ali Ahmed has arrived.</p>
          <p className="mt-1 text-xs text-ink-muted">Sent · 08:42 AM · Main Entrance</p>
        </div>
      </div>

      <div className="absolute -right-2 top-16 hidden w-44 rounded-2xl border border-line bg-surface p-3 halo-shadow sm:block animate-fade-up">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ink-muted">IDENTITY</p>
        <p className="mt-1 text-sm font-semibold">Verified at gate</p>
        <p className="mt-1 text-xs text-ink-muted">Prototype camera match</p>
      </div>
    </div>
  );
}

function EventCard({
  name,
  status,
  place,
  time,
  delay,
}: {
  name: string;
  status: string;
  place: string;
  time: string;
  delay: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl border border-line bg-canvas px-3 py-3 animate-fade-up"
      style={{ animationDelay: delay }}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs text-ink-muted">{place}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-ok">{status}</p>
        <p className="text-xs text-ink-muted">{time}</p>
      </div>
    </div>
  );
}
