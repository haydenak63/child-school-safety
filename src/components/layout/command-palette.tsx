"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const actions = [
  { label: "Add student", href: "/students/new" },
  { label: "Search students", href: "/students" },
  { label: "Attendance", href: "/attendance" },
  { label: "Terminals", href: "/terminals" },
  { label: "Parents", href: "/parents" },
  { label: "Billing", href: "/settings/billing" },
  { label: "Integrations", href: "/settings/integrations" },
  { label: "Settings", href: "/settings" },
  { label: "Dashboard", href: "/dashboard" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = useMemo(
    () => actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/30 p-4" onClick={() => setOpen(false)}>
      <div
        className="mx-auto mt-24 max-w-lg overflow-hidden rounded-2xl border border-line bg-surface halo-shadow"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Jump to a page"
          className="min-h-12 w-full border-b border-line px-4 outline-none"
        />
        <ul className="max-h-72 overflow-y-auto p-2">
          {matches.map((action) => (
            <li key={action.href}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm hover:bg-canvas"
                onClick={() => {
                  setOpen(false);
                  router.push(action.href);
                }}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
