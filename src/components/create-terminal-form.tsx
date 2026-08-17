"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/client/api";
import { Button, Card, fieldClass } from "@/components/ui/primitives";

export function CreateTerminalForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/terminals", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          location: form.get("location"),
        }),
      });
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to create terminal."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="name" placeholder="Main Entrance" required className={fieldClass} />
          <input name="location" placeholder="Front gate" required className={fieldClass} />
          <Button type="submit" disabled={busy}>
            {busy ? "Creating..." : "Add terminal"}
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </Card>
    </form>
  );
}
