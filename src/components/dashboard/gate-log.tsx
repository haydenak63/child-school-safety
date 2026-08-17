"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/primitives";

export type GateRow = {
  id: string;
  name: string;
  initials: string;
  terminal: string;
  time: string;
  relative: string;
  arrival: boolean;
};

const tabs = [
  { id: "all", label: "All" },
  { id: "in", label: "Arrivals" },
  { id: "out", label: "Departures" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function GateLog({ rows }: { rows: GateRow[] }) {
  const [tab, setTab] = useState<TabId>("all");

  const visible = rows.filter((row) =>
    tab === "all" ? true : tab === "in" ? row.arrival : !row.arrival,
  );

  return (
    <Card radius="tight" className="p-3.5 sm:rounded-[var(--radius)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-[13px] font-bold sm:text-[15px]">Gate log</h2>
        <Link href="/attendance" className="shrink-0 text-[11px] font-bold text-brand">
          View all
        </Link>
      </div>

      <div className="mt-2 flex items-center gap-1 border-b border-line">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`min-h-11 border-b-2 px-2 text-[12px] font-bold transition-colors duration-150 sm:min-h-10 sm:px-3 sm:text-[13px] ${
              tab === item.id
                ? "border-brand text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-[12px] font-medium text-ink-muted">
          Nothing recorded in this view yet.
        </p>
      ) : (
        <>
          {/* Phone: stacked rows. A table here would demand more width than a
              320px viewport has and force sideways scrolling. */}
          <ul className="divide-y divide-line sm:hidden">
            {visible.map((row) => (
              <li key={row.id} className="flex items-center gap-2.5 py-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    row.arrival ? "bg-tint-teal text-ink-teal" : "bg-tint-sky text-ink-sky"
                  }`}
                >
                  {row.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{row.name}</span>
                  <span className="block truncate text-[11px] text-ink-muted">{row.terminal}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className={`block text-[10px] font-bold uppercase ${
                      row.arrival ? "text-ink-teal" : "text-ink-sky"
                    }`}
                  >
                    {row.arrival ? "Arrived" : "Departed"}
                  </span>
                  <span className="block text-[11px] tabular-nums text-ink-muted">{row.time}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  <th className="w-[38%] py-2 font-bold">Student</th>
                  <th className="w-[27%] py-2 font-bold">Terminal</th>
                  <th className="w-[20%] py-2 font-bold">Direction</th>
                  <th className="w-[15%] py-2 text-right font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            row.arrival ? "bg-tint-teal text-ink-teal" : "bg-tint-sky text-ink-sky"
                          }`}
                        >
                          {row.initials}
                        </span>
                        <span className="min-w-0 truncate text-[13px] font-semibold">{row.name}</span>
                      </div>
                    </td>
                    <td className="truncate py-2.5 text-[13px] text-ink-soft">{row.terminal}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          row.arrival ? "bg-tint-teal text-ink-teal" : "bg-tint-sky text-ink-sky"
                        }`}
                      >
                        {row.arrival ? "Arrived" : "Departed"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-[12px] tabular-nums text-ink-muted">
                      {row.relative}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
