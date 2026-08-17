"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/primitives";

export type ChartPoint = { label: string; arrivals: number; departures: number };

const VIEW_W = 600;
const VIEW_H = 200;
const PAD_Y = 6;

function buildPaths(values: number[], max: number) {
  const points = values.length === 1 ? [values[0], values[0]] : values;
  const step = VIEW_W / (points.length - 1);
  const coords = points.map((value, index) => {
    const x = index * step;
    const y = VIEW_H - PAD_Y - (value / max) * (VIEW_H - PAD_Y * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${coords.join(" L")}`;
  return { line, area: `${line} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z` };
}

export function AttendanceChart({ today, week }: { today: ChartPoint[]; week: ChartPoint[] }) {
  const [range, setRange] = useState<"today" | "week">("today");
  const gradientId = useId();

  const series = range === "today" ? today : week;
  const arrivals = series.map((point) => point.arrivals);
  const departures = series.map((point) => point.departures);
  const peak = Math.max(...arrivals, ...departures, 0);
  const max = Math.max(peak, 1);
  const isEmpty = peak === 0;

  const arrivalPaths = buildPaths(arrivals, max);
  const departurePaths = buildPaths(departures, max);

  // Cap the axis at six labels so they never collide or force the card wider.
  const stride = Math.max(1, Math.ceil(series.length / 6));
  const axisLabels = series.filter((_, index) => index % stride === 0).map((point) => point.label);

  const legend = [
    { label: "Arrivals", className: "bg-ink-sky" },
    { label: "Departures", className: "bg-ink-amber" },
  ];

  return (
    <Card radius="tight" className="p-3.5 sm:rounded-[var(--radius)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-[13px] font-bold sm:text-[15px]">Attendance flow</h2>
        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-canvas p-0.5">
          {(["today", "week"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={`min-h-11 rounded-lg px-2.5 text-[11px] font-bold transition-colors duration-150 sm:min-h-9 sm:text-[12px] ${
                range === option ? "bg-brand text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              {option === "today" ? "Today" : "7 days"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1 flex items-center gap-3">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-muted sm:text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full ${item.className}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="block h-36 w-full sm:h-48 lg:h-56"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ink-sky)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--ink-sky)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <line
                key={fraction}
                x1="0"
                x2={VIEW_W}
                y1={PAD_Y + fraction * (VIEW_H - PAD_Y * 2)}
                y2={PAD_Y + fraction * (VIEW_H - PAD_Y * 2)}
                stroke="var(--line)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {isEmpty ? null : (
              <>
                <path d={arrivalPaths.area} fill={`url(#${gradientId})`} />
                <path
                  d={arrivalPaths.line}
                  fill="none"
                  stroke="var(--ink-sky)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={departurePaths.line}
                  fill="none"
                  stroke="var(--ink-amber)"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>

          {isEmpty ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3">
              <p className="text-center text-[11px] font-medium text-ink-muted sm:text-xs">
                No gate activity {range === "today" ? "yet today" : "in the last 7 days"}.
              </p>
            </div>
          ) : null}

          <div className="mt-2 flex justify-between gap-1">
            {axisLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="truncate text-[10px] font-medium text-ink-muted sm:text-[11px]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex w-6 shrink-0 flex-col justify-between pb-6 text-right text-[10px] font-medium tabular-nums text-ink-muted sm:w-8 sm:text-[11px]">
          <span>{max}</span>
          <span>{Math.round(max / 2)}</span>
          <span>0</span>
        </div>
      </div>
    </Card>
  );
}
