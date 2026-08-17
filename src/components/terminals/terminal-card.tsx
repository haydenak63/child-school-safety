"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/client/api";
import { Badge, Button, Card } from "@/components/ui/primitives";

type TerminalView = {
  id: string;
  name: string;
  location: string;
  status: string;
  lastActivityLabel: string;
  url: string | null;
  qrDataUrl: string | null;
};

export function TerminalCard({ terminal }: { terminal: TerminalView }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/terminals/${terminal.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to update terminal."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Terminal</p>
          <h2 className="mt-1 text-2xl font-semibold">{terminal.name}</h2>
          <p className="text-sm text-ink-muted">{terminal.location}</p>
        </div>
        <Badge tone={terminal.status === "ACTIVE" ? "ok" : "warn"}>{terminal.status}</Badge>
      </div>
      <p className="mt-4 text-sm text-ink-muted">Last activity {terminal.lastActivityLabel}</p>
      {showQr && terminal.qrDataUrl ? (
        <img src={terminal.qrDataUrl} alt={`${terminal.name} QR`} className="mx-auto mt-4 h-44 w-44" />
      ) : null}
      {terminal.url ? <p className="mt-3 break-all text-xs text-ink-muted">{terminal.url}</p> : null}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {terminal.url ? (
          <Button href={terminal.url} className="w-full">
            Open
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={() => setShowQr((value) => !value)}>
          QR code
        </Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => patch({ rotateToken: true })}>
          Regenerate URL
        </Button>
        {terminal.status === "ACTIVE" ? (
          <Button type="button" variant="danger" disabled={busy} onClick={() => patch({ status: "REVOKED" })}>
            Revoke
          </Button>
        ) : (
          <Button type="button" variant="secondary" disabled={busy} onClick={() => patch({ status: "ACTIVE" })}>
            Restore
          </Button>
        )}
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    </Card>
  );
}
