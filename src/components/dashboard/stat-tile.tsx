import Link from "next/link";
import { Sparkline } from "@/components/dashboard/sparkline";

export type TileTone = "violet" | "rose" | "sky" | "amber";

const tones: Record<TileTone, string> = {
  violet: "tile-violet",
  rose: "tile-rose",
  sky: "tile-sky",
  amber: "tile-amber",
};

export function StatTile({
  label,
  caption,
  value,
  delta,
  spark,
  tone,
  href,
}: {
  label: string;
  caption: string;
  value: number | string;
  delta?: { pct: number; up: boolean } | null;
  spark?: number[];
  tone: TileTone;
  href: string;
}) {
  return (
    <Link href={href} className="group block focus:outline-none">
      <div
        className={`${tones[tone]} relative overflow-hidden rounded-2xl p-3 text-white transition-transform duration-200 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-ink/30 sm:rounded-[var(--radius)] sm:p-4`}
      >
        {/* The label owns a full row and the delta rides with the shorter
            caption. Pairing the badge with the label instead truncates
            "Departures" at 320px. */}
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.07em] text-white/85">
          {label}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-1.5">
          <p className="min-w-0 truncate text-[10px] font-medium text-white/70 sm:text-[11px]">
            {caption}
          </p>
          {delta ? (
            <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-[2px] text-[10px] font-bold leading-none tabular-nums">
              {delta.up ? "+" : "−"}
              {delta.pct}%
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-[22px] font-bold leading-none tabular-nums sm:text-[26px] lg:text-[28px]">
            {value}
          </p>
          {spark && spark.length > 1 ? (
            <span className="w-14 shrink-0 text-white sm:w-20">
              <Sparkline values={spark} className="h-6 sm:h-7" />
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
