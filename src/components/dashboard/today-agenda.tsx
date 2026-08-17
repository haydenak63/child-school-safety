import Link from "next/link";
import { Card } from "@/components/ui/primitives";

export type AgendaEntry = {
  id: string;
  time: string;
  name: string;
  arrival: boolean;
};

export type WeekCell = {
  key: string;
  narrow: string;
  day: string;
  count: number;
  isToday: boolean;
};

export function TodayAgenda({
  dayLabel,
  weekday,
  entries,
  week,
  moreCount,
}: {
  dayLabel: string;
  weekday: string;
  entries: AgendaEntry[];
  week: WeekCell[];
  moreCount: number;
}) {
  const busiest = Math.max(...week.map((cell) => cell.count), 1);

  return (
    <Card radius="tight" className="p-3.5 sm:rounded-[var(--radius)] sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="min-w-0 truncate text-[15px] font-bold sm:text-[17px]">
          {dayLabel} <span className="font-medium text-ink-muted">{weekday}</span>
        </h2>
        <Link href="/attendance" className="shrink-0 text-[11px] font-bold text-brand">
          All
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {week.map((cell) => (
          <div key={cell.key} className="min-w-0 text-center">
            <p className="text-[9px] font-semibold uppercase text-ink-muted">{cell.narrow}</p>
            <p
              className={`mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums ${
                cell.isToday ? "bg-brand text-white" : "text-ink-soft"
              }`}
            >
              {cell.day}
            </p>
            <span
              className="mx-auto mt-1 block w-1 rounded-full bg-ink-sky"
              style={{ height: `${Math.max(2, Math.round((cell.count / busiest) * 14))}px` }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <ol className="mt-3 space-y-2 border-t border-line pt-3">
        {entries.length === 0 ? (
          <li className="py-3 text-center text-[11px] font-medium text-ink-muted">
            No scans recorded today yet.
          </li>
        ) : (
          entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-2">
              <span className="w-9 shrink-0 text-[11px] font-bold tabular-nums text-ink-muted">
                {entry.time}
              </span>
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  entry.arrival ? "bg-ink-teal" : "bg-ink-sky"
                }`}
              />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{entry.name}</span>
              <span
                className={`shrink-0 text-[10px] font-bold uppercase ${
                  entry.arrival ? "text-ink-teal" : "text-ink-sky"
                }`}
              >
                {entry.arrival ? "In" : "Out"}
              </span>
            </li>
          ))
        )}
      </ol>

      {moreCount > 0 ? (
        <p className="mt-2 text-[11px] font-medium text-ink-muted">
          {moreCount} more {moreCount === 1 ? "event" : "events"} today
        </p>
      ) : null}
    </Card>
  );
}
