"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/client/api";
import { Button, Card } from "@/components/ui/primitives";

const steps = ["Student", "Secure link", "Mobile capture", "Complete"];

export function EnrollmentQr({
  studentId,
  studentName,
  classLabel,
}: {
  studentId: string;
  studentName: string;
  classLabel: string;
}) {
  const [data, setData] = useState<{ qrDataUrl: string; url: string; expiresAt: string } | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const created = await api<{ qrDataUrl: string; url: string; expiresAt: string }>(
        "/api/enrollment/create",
        { method: "POST", body: JSON.stringify({ studentId }) },
      );
      setData(created);
    } catch (err) {
      setError(errorMessage(err, "Unable to start enrollment."));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!data) return;
    function tick() {
      const ms = new Date(data!.expiresAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
    }
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [data]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const activeStep = data ? 2 : 1;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-2xl border px-3 py-3 text-sm ${
              index <= activeStep ? "border-brand bg-surface text-brand" : "border-line text-ink-muted"
            }`}
          >
            <p className="font-mono text-xs">{String(index + 1).padStart(2, "0")}</p>
            <p className="mt-1 font-medium">{step}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <p className="eyebrow">Student</p>
        <h2 className="mt-2 text-xl font-semibold">{studentName}</h2>
        <p className="text-sm text-ink-muted">{classLabel}</p>
        <p className="mt-4 text-sm leading-6 text-ink-muted">
          Scan this QR code with the mobile phone. The enrollment session expires automatically and
          the fingerprint template is never displayed.
        </p>
      </Card>

      <Card className="p-6 text-center">
        {data ? (
          <>
            <img src={data.qrDataUrl} alt="Enrollment QR code" className="mx-auto h-56 w-56" />
            <p className="mt-4 text-lg font-semibold">Expires in {minutes}:{seconds}</p>
            <p className="mt-2 break-all text-xs text-ink-muted">{data.url}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(data.url);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied" : "Copy link"}
              </Button>
              <Button type="button" variant="secondary" onClick={start} disabled={busy}>
                Regenerate
              </Button>
              <Button type="button" variant="ghost" href={`/students/${studentId}`}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={start} disabled={busy}>
            {busy ? "Generating..." : "Generate enrollment QR"}
          </Button>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Card>
    </div>
  );
}
