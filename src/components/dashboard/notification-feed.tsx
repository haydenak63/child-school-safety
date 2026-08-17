import { Card } from "@/components/ui/primitives";
import { ArrowInIcon, ArrowOutIcon, BellIcon } from "@/components/dashboard/icons";

export type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  relative: string;
  status: string;
  arrival: boolean | null;
};

const statusTone: Record<string, string> = {
  SENT: "bg-ok-soft text-ok",
  MOCKED: "bg-tint-violet text-ink-violet",
  PENDING: "bg-warn-soft text-warn",
  FAILED: "bg-danger-soft text-danger",
};

export function NotificationFeed({ items }: { items: NotificationItem[] }) {
  return (
    <Card radius="tight" className="p-3.5 sm:rounded-[var(--radius)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-[13px] font-bold sm:text-[15px]">Parent alerts</h2>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-[12px] font-medium text-ink-muted">
          No alerts generated yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item) => {
            const Icon = item.arrival === null ? BellIcon : item.arrival ? ArrowInIcon : ArrowOutIcon;
            const tint =
              item.arrival === null
                ? "bg-tint-violet text-ink-violet"
                : item.arrival
                  ? "bg-tint-teal text-ink-teal"
                  : "bg-tint-sky text-ink-sky";
            return (
              <li key={item.id} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tint}`}
                >
                  <Icon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{item.title}</p>
                  <p className="truncate text-[11px] text-ink-muted">{item.subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      statusTone[item.status] ?? "bg-canvas text-ink-soft"
                    }`}
                  >
                    {item.status}
                  </span>
                  <p className="mt-1 text-[10px] font-medium text-ink-muted">{item.relative}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
