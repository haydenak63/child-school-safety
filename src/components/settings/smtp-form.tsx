"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/client/api";
import { Badge, Button, Card, Field, fieldClass } from "@/components/ui/primitives";
import type { GatewayPublicView } from "@/lib/services/platform";

export function SmtpForm({ settings }: { settings: GatewayPublicView["smtp"] }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(settings.enabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await api("/api/settings/smtp", {
        method: "PUT",
        body: JSON.stringify({
          smtpEnabled: enabled,
          smtpHost: form.get("smtpHost"),
          smtpPort: Number(form.get("smtpPort")),
          smtpUser: form.get("smtpUser"),
          smtpFrom: form.get("smtpFrom"),
          smtpPassword: form.get("smtpPassword"),
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to save SMTP settings."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold">Email (SMTP)</h2>
          <p className="mt-1 text-[12px] text-ink-muted">
            Used for receipts and operator notices. Messages are not sent until you enable this.
          </p>
        </div>
        <Badge tone={enabled ? "ok" : "neutral"}>{enabled ? "On" : "Off"}</Badge>
      </div>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="flex min-h-11 items-center gap-3 text-[13px] font-medium">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Enable outbound email
        </label>
        <Field label="Host">
          <input name="smtpHost" defaultValue={settings.host} className={fieldClass} placeholder="smtp.example.com" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Port">
            <input name="smtpPort" type="number" defaultValue={settings.port} className={fieldClass} />
          </Field>
          <Field label="Username">
            <input name="smtpUser" defaultValue={settings.user} className={fieldClass} autoComplete="off" />
          </Field>
        </div>
        <Field label="From address">
          <input name="smtpFrom" defaultValue={settings.from} className={fieldClass} placeholder="alerts@school.edu" />
        </Field>
        <Field label="Password">
          <input
            name="smtpPassword"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            placeholder={settings.passwordHint ? `•••• ${settings.passwordHint} — leave blank to keep` : ""}
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {saved ? <p className="text-sm text-ok">SMTP settings saved.</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save email settings"}
        </Button>
      </form>
    </Card>
  );
}
