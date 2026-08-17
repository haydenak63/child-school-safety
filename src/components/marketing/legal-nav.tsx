"use client";

import { useState } from "react";
import Link from "next/link";

export function LegalNav({
  items,
}: {
  items: Array<{ id: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between rounded-xl border border-line bg-surface px-4 text-sm font-medium"
          onClick={() => setOpen((value) => !value)}
        >
          On this page
          <span>{open ? "–" : "+"}</span>
        </button>
        {open ? (
          <nav className="mt-2 rounded-xl border border-line bg-surface p-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center px-2 text-sm text-ink-soft"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
      <nav className="sticky top-24 hidden lg:block">
        <p className="eyebrow">On this page</p>
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`#${item.id}`} className="text-sm text-ink-soft hover:text-ink">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
