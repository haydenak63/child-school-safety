import { Card } from "@/components/ui/primitives";

type Segment = { label: string; value: number; color: string; dot: string };

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BreakdownDonut({
  onSite,
  departed,
  awaiting,
}: {
  onSite: number;
  departed: number;
  awaiting: number;
}) {
  const segments: Segment[] = [
    { label: "On site", value: onSite, color: "var(--ink-teal)", dot: "bg-ink-teal" },
    { label: "Departed", value: departed, color: "var(--ink-sky)", dot: "bg-ink-sky" },
    { label: "Awaiting", value: awaiting, color: "var(--ink-amber)", dot: "bg-ink-amber" },
  ];

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  let offset = 0;
  const arcs = segments.map((segment) => {
    const fraction = total > 0 ? segment.value / total : 0;
    const arc = {
      ...segment,
      dash: fraction * CIRCUMFERENCE,
      offset,
      pct: total > 0 ? Math.round(fraction * 100) : 0,
    };
    offset += fraction * CIRCUMFERENCE;
    return arc;
  });

  return (
    <Card radius="tight" className="flex flex-col p-3.5 sm:rounded-[var(--radius)] sm:p-5">
      <h2 className="text-[13px] font-bold sm:text-[15px]">Roll call</h2>
      <p className="mt-0.5 text-[10px] font-medium text-ink-muted sm:text-[11px]">
        Where every student stands today
      </p>

      <div className="mt-3 flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-[168px]">
          <svg viewBox="0 0 100 100" className="block w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="12" />
            {total > 0
              ? arcs.map((arc) =>
                  arc.value > 0 ? (
                    <circle
                      key={arc.label}
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="12"
                      strokeLinecap="butt"
                      strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
                      strokeDashoffset={-arc.offset}
                    />
                  ) : null,
                )
              : null}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[24px] font-bold leading-none tabular-nums sm:text-[28px]">{total}</p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted sm:text-[10px]">
              Students
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 border-t border-line pt-3">
        {arcs.map((arc) => (
          <div key={arc.label} className="min-w-0 text-center">
            <p className="text-[15px] font-bold leading-none tabular-nums sm:text-[17px]">
              {arc.pct}%
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[9px] font-semibold text-ink-muted sm:text-[10px]">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${arc.dot}`} />
              <span className="truncate">{arc.label}</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
