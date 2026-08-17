"use client";

import { Badge, Card } from "@/components/ui/primitives";

const extras = [
  {
    name: "WhatsApp Cloud API",
    body: "Direct Meta Cloud sending, without IQ Pigeon. Kept as a fallback once a school has its own WABA.",
    status: "Soon" as const,
    tone: "warn" as const,
  },
  {
    name: "SMS",
    body: "Text-message alerts for parents who are not on WhatsApp. Provider selection comes after payments go live.",
    status: "Soon" as const,
    tone: "warn" as const,
  },
];

export function ExtraIntegrations() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {extras.map((item) => (
        <Card key={item.name} radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 text-[13px] font-semibold sm:text-[15px]">{item.name}</h3>
            <Badge tone={item.tone}>{item.status}</Badge>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-ink-muted">{item.body}</p>
        </Card>
      ))}
    </div>
  );
}
