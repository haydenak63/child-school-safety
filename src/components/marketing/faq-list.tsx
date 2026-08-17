"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does attendance work?",
    a: "A student is identified at a school terminal. CSS records an arrival or departure and stores the event with the terminal, time, and match confidence.",
  },
  {
    q: "How does enrollment work?",
    a: "An administrator generates a one-time QR link. A phone opens the enrollment page, captures a fingerprint image, and CSS creates a protected template.",
  },
  {
    q: "How are terminals used?",
    a: "Each terminal has a unique URL and QR code. Staff keep the page open. After each result, the terminal returns to ready for the next scan.",
  },
  {
    q: "How do parent notifications work?",
    a: "When attendance is recorded, CSS sends the parent a WhatsApp message and keeps a record of it in the dashboard.",
  },
  {
    q: "Can dedicated hardware be used later?",
    a: "Yes. Matching runs through a biometric provider interface so a hardware implementation can replace the camera matcher later.",
  },
  {
    q: "Can schools have multiple terminals?",
    a: "Yes. Schools can create, revoke, and regenerate multiple entrance and exit terminals.",
  },
];

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line rounded-[24px] border border-line bg-surface">
      {faqs.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : index)}
            >
              {item.q}
              <span aria-hidden className="text-ink-muted">
                {expanded ? "–" : "+"}
              </span>
            </button>
            {expanded ? <p className="px-5 pb-5 text-sm leading-6 text-ink-muted">{item.a}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
