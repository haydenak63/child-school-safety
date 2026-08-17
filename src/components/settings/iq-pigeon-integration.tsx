"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { IntegrationTestStatus } from "@prisma/client";
import { api, errorMessage } from "@/lib/client/api";
import { Badge, Button, Card, Field, fieldClass } from "@/components/ui/primitives";
import type { IntegrationView } from "@/lib/services/integrations";

type Tone = "ok" | "warn" | "danger";

const STATUS: Record<IntegrationTestStatus, { label: string; tone: Tone }> = {
  OK: { label: "Connected", tone: "ok" },
  AUTH_FAILED: { label: "Credentials rejected", tone: "danger" },
  REMOTE_DISABLED: { label: "Disabled by IQ Pigeon", tone: "danger" },
  SUBSCRIPTION_INACTIVE: { label: "Subscription paused", tone: "warn" },
  INVALID_PAYLOAD: { label: "Event data rejected", tone: "danger" },
  RATE_LIMITED: { label: "Rate limited", tone: "warn" },
  SERVER_ERROR: { label: "IQ Pigeon error", tone: "warn" },
  UNREACHABLE: { label: "Host unreachable", tone: "warn" },
  UNEXPECTED: { label: "Unexpected response", tone: "danger" },
};

type TestResult = {
  ok: boolean;
  status: IntegrationTestStatus;
  message: string;
};

function maskedPlaceholder(hint: string | null): string {
  return hint ? `•••• ${hint} — leave blank to keep` : "";
}

function formatTested(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function IqPigeonIntegration({ integration }: { integration: IntegrationView }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(integration.enabled);
  const [testRecipient, setTestRecipient] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const stored = integration.lastStatus ? STATUS[integration.lastStatus] : null;
  const testedAt = formatTested(integration.lastTestedAt);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    setResult(null);
    try {
      await api("/api/integrations/iq-pigeon", {
        method: "PUT",
        body: JSON.stringify({
          enabled,
          baseUrl: data.get("baseUrl"),
          apiKey: data.get("apiKey"),
          secret: data.get("secret"),
        }),
      });
      // Clear the credential inputs so a typed secret does not linger in the DOM.
      form.querySelectorAll<HTMLInputElement>("input[type=password]").forEach((input) => {
        input.value = "";
      });
      setSaved(true);
      setDirty(false);
      router.refresh();
    } catch (err) {
      setSaveError(errorMessage(err, "Unable to save the IQ Pigeon connection."));
    } finally {
      setSaving(false);
    }
  }

  async function onTest() {
    setTesting(true);
    setSaveError(null);
    setSaved(false);
    setResult(null);
    try {
      const response = await api<{ result: TestResult }>("/api/integrations/iq-pigeon/test", {
        method: "POST",
        body: JSON.stringify({ testRecipient }),
      });
      setResult(response.result);
      router.refresh();
    } catch (err) {
      setSaveError(errorMessage(err, "Unable to run the connection test."));
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card radius="tight" className="p-3.5 sm:rounded-[var(--radius)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold sm:text-base">IQ Pigeon</h2>
          <p className="mt-1 text-[12px] leading-5 text-ink-muted sm:text-sm">
            Pushes every gate arrival and departure to this school&apos;s IQ Pigeon account, which
            sends the parents a WhatsApp message from its own approved template.
          </p>
        </div>
        <Badge tone={integration.enabled ? "ok" : "neutral"}>
          {integration.enabled ? "Live" : "Off"}
        </Badge>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <Field label="Base URL">
          <input
            name="baseUrl"
            type="url"
            inputMode="url"
            required
            defaultValue={integration.baseUrl}
            placeholder="https://school.iqpigeon.com"
            autoComplete="off"
            onChange={() => setDirty(true)}
            className={fieldClass}
          />
        </Field>

        <Field label="API key">
          <input
            name="apiKey"
            type="password"
            autoComplete="new-password"
            placeholder={maskedPlaceholder(integration.apiKeyHint) || "iqp_sch_…"}
            onChange={() => setDirty(true)}
            className={fieldClass}
          />
        </Field>

        <Field label="Shared secret">
          <input
            name="secret"
            type="password"
            autoComplete="new-password"
            placeholder={maskedPlaceholder(integration.secretHint) || "Signing secret"}
            onChange={() => setDirty(true)}
            className={fieldClass}
          />
        </Field>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => {
            setEnabled((value) => !value);
            setDirty(true);
          }}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-line px-3 text-left outline-none transition-colors duration-150 hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink">Send gate events to IQ Pigeon</span>
            <span className="block text-[11px] text-ink-muted">
              {enabled ? "Parents are notified through IQ Pigeon." : "Gate events stay in CSS."}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
              enabled ? "bg-brand" : "bg-line-strong"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-[left] duration-150 ${
                enabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>

        {integration.ingestUrl ? (
          <p className="break-all text-[11px] leading-4 text-ink-muted">
            Posting to {integration.ingestUrl}
          </p>
        ) : null}

        {saveError ? <p className="text-[12px] text-danger sm:text-sm">{saveError}</p> : null}
        {saved ? <p className="text-[12px] text-ok sm:text-sm">Connection saved.</p> : null}

        <Field label="Test recipient (optional)">
          <input
            name="testRecipient"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            value={testRecipient}
            onChange={(event) => setTestRecipient(event.target.value)}
            placeholder="+923001112223 — your own number"
            className={fieldClass}
          />
        </Field>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save connection"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onTest}
            disabled={testing || saving || !integration.configured || dirty}
          >
            {testing ? "Testing..." : "Send test"}
          </Button>
        </div>

        <p className="text-[11px] leading-4 text-ink-muted">
          {!integration.configured
            ? "Save the base URL and credentials to enable the connection test."
            : dirty
              ? "Save your changes first — the test uses the stored credentials."
              : "The test sends one real signed event to IQ Pigeon. Add your own number above to receive the WhatsApp message yourself."}
        </p>
      </form>

      <div className="mt-4 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">Last test</span>
          {result ? (
            <Badge tone={result.ok ? "ok" : STATUS[result.status].tone}>
              {STATUS[result.status].label}
            </Badge>
          ) : stored ? (
            <Badge tone={stored.tone}>{stored.label}</Badge>
          ) : (
            <Badge>Never tested</Badge>
          )}
          {!result && testedAt ? (
            <span className="text-[11px] text-ink-muted">{testedAt}</span>
          ) : null}
        </div>
        {result ? (
          <p
            className={`mt-2 break-words text-[12px] leading-5 sm:text-sm ${
              result.ok ? "text-ok" : "text-danger"
            }`}
          >
            {result.message}
          </p>
        ) : integration.lastError ? (
          <p className="mt-2 break-words text-[12px] leading-5 text-danger sm:text-sm">
            {integration.lastError}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
