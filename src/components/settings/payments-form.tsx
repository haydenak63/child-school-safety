"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { GatewayMode } from "@prisma/client";
import { api, errorMessage } from "@/lib/client/api";
import { Badge, Button, Card, Field, fieldClass } from "@/components/ui/primitives";
import type { GatewayPublicView } from "@/lib/services/platform";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-[13px] font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-brand"
      />
      {label}
    </label>
  );
}

export function PaymentsForm({ settings }: { settings: GatewayPublicView }) {
  const router = useRouter();
  const [billingEnabled, setBillingEnabled] = useState(settings.billingEnabled);
  const [stripeEnabled, setStripeEnabled] = useState(settings.stripe.enabled);
  const [stripeMode, setStripeMode] = useState<GatewayMode>(settings.stripe.mode);
  const [paypakEnabled, setPaypakEnabled] = useState(settings.paypak.enabled);
  const [jazzcashEnabled, setJazzcashEnabled] = useState(settings.jazzcash.enabled);
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
      await api("/api/settings/payments", {
        method: "PUT",
        body: JSON.stringify({
          billingEnabled,
          trialDays: Number(form.get("trialDays")),
          stripeEnabled,
          stripeMode,
          stripePublishableKey: form.get("stripePublishableKey"),
          stripeSecret: form.get("stripeSecret"),
          stripeWebhookSecret: form.get("stripeWebhookSecret"),
          paypakEnabled,
          paypakMerchantId: form.get("paypakMerchantId"),
          paypakApiUrl: form.get("paypakApiUrl"),
          paypakSecret: form.get("paypakSecret"),
          jazzcashEnabled,
          jazzcashMerchantId: form.get("jazzcashMerchantId"),
          jazzcashPassword: form.get("jazzcashPassword"),
          jazzcashIntegrity: form.get("jazzcashIntegrity"),
        }),
      });
      event.currentTarget.querySelectorAll<HTMLInputElement>("input[type=password]").forEach((input) => {
        input.value = "";
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to save payment settings."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold">Payment collection</h2>
            <p className="mt-1 text-[12px] leading-5 text-ink-muted">
              Keep this off until a gateway is ready. Schools can still see plans; checkout will not
              charge anyone.
            </p>
          </div>
          <Badge tone={billingEnabled ? "ok" : "warn"}>{billingEnabled ? "Live" : "Paused"}</Badge>
        </div>
        <div className="mt-4 space-y-3">
          <Toggle
            checked={billingEnabled}
            onChange={setBillingEnabled}
            label="Accept payments from schools"
          />
          <Field label="Trial length (days)">
            <input
              name="trialDays"
              type="number"
              min={0}
              max={90}
              defaultValue={settings.trialDays}
              className={fieldClass}
            />
          </Field>
        </div>
      </Card>

      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">Stripe</h2>
            <p className="mt-1 text-[12px] text-ink-muted">Cards, internationally. Use test keys until you go live.</p>
          </div>
          <Badge tone={stripeEnabled ? "ok" : "neutral"}>{stripeEnabled ? "On" : "Off"}</Badge>
        </div>
        <div className="mt-4 space-y-3">
          <Toggle checked={stripeEnabled} onChange={setStripeEnabled} label="Enable Stripe" />
          <Field label="Mode">
            <select
              value={stripeMode}
              onChange={(event) => setStripeMode(event.target.value as GatewayMode)}
              className={fieldClass}
            >
              <option value="TEST">Test</option>
              <option value="LIVE">Live</option>
            </select>
          </Field>
          <Field label="Publishable key">
            <input
              name="stripePublishableKey"
              defaultValue={settings.stripe.publishableKey}
              className={fieldClass}
              placeholder="pk_test_…"
              autoComplete="off"
            />
          </Field>
          <Field label="Secret key">
            <input
              name="stripeSecret"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder={
                settings.stripe.secretHint
                  ? `•••• ${settings.stripe.secretHint} — leave blank to keep`
                  : "sk_test_…"
              }
            />
          </Field>
          <Field label="Webhook signing secret">
            <input
              name="stripeWebhookSecret"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder={
                settings.stripe.webhookHint
                  ? `•••• ${settings.stripe.webhookHint} — leave blank to keep`
                  : "whsec_…"
              }
            />
          </Field>
        </div>
      </Card>

      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">PayPak</h2>
            <p className="mt-1 text-[12px] text-ink-muted">Pakistan bank and wallet checkout.</p>
          </div>
          <Badge tone={paypakEnabled ? "ok" : "neutral"}>{paypakEnabled ? "On" : "Off"}</Badge>
        </div>
        <div className="mt-4 space-y-3">
          <Toggle checked={paypakEnabled} onChange={setPaypakEnabled} label="Enable PayPak" />
          <Field label="Merchant ID">
            <input
              name="paypakMerchantId"
              defaultValue={settings.paypak.merchantId}
              className={fieldClass}
              autoComplete="off"
            />
          </Field>
          <Field label="API URL">
            <input
              name="paypakApiUrl"
              defaultValue={settings.paypak.apiUrl}
              className={fieldClass}
              placeholder="https://api.paypak.pk"
            />
          </Field>
          <Field label="Secret">
            <input
              name="paypakSecret"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder={
                settings.paypak.secretHint
                  ? `•••• ${settings.paypak.secretHint} — leave blank to keep`
                  : ""
              }
            />
          </Field>
        </div>
      </Card>

      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">JazzCash</h2>
            <p className="mt-1 text-[12px] text-ink-muted">Mobile wallet collection in Pakistan.</p>
          </div>
          <Badge tone={jazzcashEnabled ? "ok" : "neutral"}>{jazzcashEnabled ? "On" : "Off"}</Badge>
        </div>
        <div className="mt-4 space-y-3">
          <Toggle checked={jazzcashEnabled} onChange={setJazzcashEnabled} label="Enable JazzCash" />
          <Field label="Merchant ID">
            <input
              name="jazzcashMerchantId"
              defaultValue={settings.jazzcash.merchantId}
              className={fieldClass}
              autoComplete="off"
            />
          </Field>
          <Field label="Password">
            <input
              name="jazzcashPassword"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder={
                settings.jazzcash.passwordHint
                  ? `•••• ${settings.jazzcash.passwordHint} — leave blank to keep`
                  : ""
              }
            />
          </Field>
          <Field label="Integrity salt">
            <input
              name="jazzcashIntegrity"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder={
                settings.jazzcash.integrityHint
                  ? `•••• ${settings.jazzcash.integrityHint} — leave blank to keep`
                  : ""
              }
            />
          </Field>
        </div>
      </Card>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved ? <p className="text-sm text-ok">Payment settings saved. Nothing has been charged.</p> : null}
      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? "Saving..." : "Save payment settings"}
      </Button>
    </form>
  );
}
