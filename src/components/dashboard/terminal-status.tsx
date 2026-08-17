import Link from "next/link";
import { Card } from "@/components/ui/primitives";
import { GateIcon } from "@/components/dashboard/icons";

export type TerminalRow = {
  id: string;
  name: string;
  location: string;
  active: boolean;
  lastSeen: string;
};

export function TerminalStatus({ terminals }: { terminals: TerminalRow[] }) {
  return (
    <Card radius="tight" className="p-3.5 sm:rounded-[var(--radius)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-[13px] font-bold sm:text-[15px]">Terminals</h2>
        <Link href="/terminals" className="shrink-0 text-[11px] font-bold text-brand">
          Manage
        </Link>
      </div>

      {terminals.length === 0 ? (
        <p className="py-8 text-center text-[12px] font-medium text-ink-muted">
          No terminals created yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {terminals.map((terminal) => (
            <li key={terminal.id} className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  terminal.active ? "bg-tint-teal text-ink-teal" : "bg-canvas text-ink-muted"
                }`}
              >
                <GateIcon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{terminal.name}</span>
                <span className="block truncate text-[11px] text-ink-muted">{terminal.lastSeen}</span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                  terminal.active ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
                }`}
              >
                {terminal.active ? "Live" : "Revoked"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
