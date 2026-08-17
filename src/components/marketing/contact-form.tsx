"use client";

import { FormEvent, useState } from "react";
import { api, errorMessage } from "@/lib/client/api";
import { Button, fieldClass } from "@/components/ui/primitives";

export function ContactForm({ intent = "contact" }: { intent?: "contact" | "demo" }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          intent,
          name: form.get("name"),
          organization: form.get("organization"),
          email: form.get("email"),
          phone: form.get("phone"),
          message: form.get("message"),
        }),
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, "Unable to send this request."));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[24px] border border-line bg-surface p-6">
        <p className="text-lg font-semibold">Request received.</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          This prototype stores the request on the server for review. It is not forwarded to a live
          inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[24px] border border-line bg-surface p-6 halo-shadow">
      <label className="block text-sm font-medium text-ink-soft">
        Name
        <input name="name" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="mt-4 block text-sm font-medium text-ink-soft">
        School / organization
        <input name="organization" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="mt-4 block text-sm font-medium text-ink-soft">
        Email
        <input type="email" name="email" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="mt-4 block text-sm font-medium text-ink-soft">
        Phone
        <input name="phone" className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="mt-4 block text-sm font-medium text-ink-soft">
        Message
        <textarea name="message" required rows={5} className={`${fieldClass} mt-1.5 py-3`} />
      </label>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={busy} className="mt-5 w-full">
        {busy ? "Sending..." : intent === "demo" ? "Request a demo" : "Send message"}
      </Button>
    </form>
  );
}
