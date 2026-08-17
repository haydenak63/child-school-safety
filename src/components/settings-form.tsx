"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/client/api";
import { Button, Field, fieldClass } from "@/components/ui/primitives";

export function SettingsForm({
  school,
}: {
  school: {
    name: string;
    address: string;
    timezone: string;
    scanCooldownSeconds: number;
    matchThreshold: number;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await api("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.get("name"),
          address: form.get("address"),
          timezone: form.get("timezone"),
          scanCooldownSeconds: Number(form.get("scanCooldownSeconds")),
          matchThreshold: Number(form.get("matchThreshold")),
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to save settings."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="School name">
        <input name="name" defaultValue={school.name} className={fieldClass} />
      </Field>
      <Field label="Address">
        <input name="address" defaultValue={school.address} className={fieldClass} />
      </Field>
      <Field label="Timezone">
        <input name="timezone" defaultValue={school.timezone} className={fieldClass} />
      </Field>
      <Field label="Duplicate scan cooldown (seconds)">
        <input name="scanCooldownSeconds" type="number" defaultValue={school.scanCooldownSeconds} className={fieldClass} />
      </Field>
      <Field label="Match threshold (0.35–0.95)">
        <input name="matchThreshold" type="number" step="0.01" defaultValue={school.matchThreshold} className={fieldClass} />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved ? <p className="text-sm text-ok">Settings saved.</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
