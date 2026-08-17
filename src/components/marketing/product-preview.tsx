export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-surface halo-shadow">
      <div className="flex items-center gap-2 border-b border-line bg-canvas px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <p className="ml-2 truncate text-xs text-ink-muted">css.iqpigeon.com / dashboard</p>
      </div>
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-4">
        {[
          ["Students", "48"],
          ["Parents", "46"],
          ["Arrivals", "31"],
          ["Departures", "12"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-canvas p-4">
            <p className="text-xs text-ink-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-4 py-4 sm:px-6">
        <p className="text-sm font-semibold">Recent activity</p>
        <div className="mt-3 space-y-3">
          {[
            ["08:42 AM", "Ali Ahmed", "ARRIVED", "Main Entrance"],
            ["08:45 AM", "Sara Khan", "ARRIVED", "Main Entrance"],
            ["02:17 PM", "Ali Ahmed", "DEPARTED", "Main Exit"],
          ].map((row) => (
            <div key={row.join()} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{row[1]}</p>
                <p className="text-xs text-ink-muted">
                  {row[0]} · {row[3]}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-ok">{row[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
