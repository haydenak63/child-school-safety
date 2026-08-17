import { Button, Card } from "@/components/ui/primitives";
import { TrendUpIcon } from "@/components/dashboard/icons";

export function HeroMetric({
  onSite,
  totalStudents,
  arrivals,
  departures,
  awaiting,
}: {
  onSite: number;
  totalStudents: number;
  arrivals: number;
  departures: number;
  awaiting: number;
}) {
  const share = totalStudents > 0 ? Math.round((onSite / totalStudents) * 100) : 0;

  const breakdown = [
    { label: "On site", value: onSite, dot: "bg-ink-teal" },
    { label: "Departed", value: departures, dot: "bg-ink-sky" },
    { label: "Awaiting", value: awaiting, dot: "bg-ink-amber" },
  ];

  return (
    <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            On site now
          </p>
          <p className="mt-1 text-[34px] font-bold leading-none tracking-tight tabular-nums sm:text-[44px] lg:text-[52px]">
            {onSite}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-tight">
            <span className="inline-flex items-center gap-1 font-bold text-ok">
              <TrendUpIcon className="h-[14px] w-[14px]" />
              {arrivals} arrived
            </span>
            <span className="text-ink-muted">
              today · {share}% of {totalStudents} students
            </span>
          </p>
        </div>
        <Button href="/attendance" className="shrink-0 px-3 text-[13px] sm:px-4 sm:text-sm">
          Live log
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
        {breakdown.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted sm:text-[11px]">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
              <span className="truncate">{item.label}</span>
            </p>
            <p className="mt-0.5 text-[17px] font-bold leading-none tabular-nums sm:text-[19px]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
