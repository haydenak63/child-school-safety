"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BillingPlan, SubscriptionStatus } from "@prisma/client";
import { api, errorMessage } from "@/lib/client/api";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { PLANS, formatPkr, type PlanCatalogItem } from "@/lib/billing/plans";

const STATUS: Record<SubscriptionStatus, { label: string; tone: "ok" | "warn" | "danger" | "brand" }> = {
  TRIALING: { label: "Trial", tone: "brand" },
  ACTIVE: { label: "Active", tone: "ok" },
  PAST_DUE: { label: "Past due", tone: "danger" },
  PAUSED: { label: "Paused", tone: "warn" },
  CANCELED: { label: "Canceled", tone: "warn" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function BillingBoard({
  subscription,
  usage,
  catalogPlan,
  billingEnabled,
  operator,
}: {
  subscription: {
    plan: BillingPlan;
    status: SubscriptionStatus;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    assignedManually: boolean;
  };
  usage: { students: number; terminals: number; parents: number };
  catalogPlan: PlanCatalogItem;
  billingEnabled: boolean;
  operator: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<BillingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = STATUS[subscription.status];

  async function choose(plan: BillingPlan, manual: boolean) {
    setBusy(plan);
    setError(null);
    try {
      await api("/api/billing", {
        method: "POST",
        body: JSON.stringify({ plan, manual }),
      });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to change plan."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {billingEnabled ? null : (
        <Card radius="tight" className="border-warn/30 bg-warn-soft p-4 sm:rounded-[var(--radius)] sm:p-5">
          <p className="text-[13px] font-semibold text-warn">Payments are paused</p>
          <p className="mt-1 text-[12px] leading-5 text-ink-soft">
            The full billing design is in place, but no payment gateway is collecting money yet.
            {operator
              ? " Configure Stripe, PayPak, or JazzCash under Payments, then turn on payment collection."
              : " A platform operator will turn this on once a gateway is ready."}
          </p>
        </Card>
      )}

      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Current plan</p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight">{catalogPlan.name}</h2>
            <p className="mt-1 text-[13px] text-ink-muted">{catalogPlan.tagline}</p>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="mt-4 text-[28px] font-semibold tracking-tight">
          {formatPkr(catalogPlan.monthlyPkr)}
          <span className="ml-1 text-[13px] font-medium text-ink-muted">/ month</span>
        </p>
        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
          {[
            ["Students", `${usage.students}${catalogPlan.studentLimit ? ` / ${catalogPlan.studentLimit}` : ""}`],
            ["Gates", `${usage.terminals}${catalogPlan.terminalLimit ? ` / ${catalogPlan.terminalLimit}` : ""}`],
            ["Parents", String(usage.parents)],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
              <dd className="mt-1 truncate text-[15px] font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[12px] text-ink-muted">
          {subscription.status === "TRIALING"
            ? `Trial ends ${formatDate(subscription.trialEndsAt)}.`
            : `Current period ends ${formatDate(subscription.currentPeriodEnd)}.`}
          {subscription.assignedManually ? " Assigned manually — no card on file." : ""}
        </p>
      </Card>

      <div>
        <h2 className="text-[15px] font-semibold">Plans</h2>
        <p className="mt-1 text-[12px] text-ink-muted">
          {billingEnabled
            ? "Choose a plan. Checkout will use the gateway configured by the platform operator."
            : operator
              ? "Checkout is disabled. You can still assign a plan to this school by hand."
              : "Plan changes open once payments are turned on."}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const current = plan.id === subscription.plan;
          return (
            <Card
              key={plan.id}
              radius="tight"
              className={`flex flex-col p-4 sm:rounded-[var(--radius)] sm:p-5 ${
                plan.popular ? "border-brand/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-semibold">{plan.name}</h3>
                {plan.popular ? <Badge tone="brand">Popular</Badge> : null}
              </div>
              <p className="mt-1 text-[12px] text-ink-muted">{plan.tagline}</p>
              <p className="mt-3 text-[22px] font-semibold tracking-tight">
                {formatPkr(plan.monthlyPkr)}
                <span className="text-[12px] font-medium text-ink-muted"> / mo</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1.5 text-[12px] text-ink-soft">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="mt-5 space-y-2">
                <Button
                  type="button"
                  variant={current ? "secondary" : "primary"}
                  className="w-full"
                  disabled={current || busy !== null || (!billingEnabled && !operator)}
                  onClick={() => choose(plan.id, Boolean(operator && !billingEnabled))}
                >
                  {current ? "Current plan" : busy === plan.id ? "Saving..." : billingEnabled ? "Subscribe" : "Assign"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-5">
          <h2 className="text-[15px] font-semibold">Payment method</h2>
          <p className="mt-2 text-[12px] leading-5 text-ink-muted">
            No card or wallet is on file. This fills in automatically the first time a school pays
            through a live gateway.
          </p>
          <Button type="button" variant="secondary" className="mt-4" disabled>
            Add payment method
          </Button>
        </Card>
        <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-5">
          <h2 className="text-[15px] font-semibold">Invoices</h2>
          <p className="mt-2 text-[12px] leading-5 text-ink-muted">
            Invoice history appears here once payment collection is switched on. Nothing has been
            charged.
          </p>
        </Card>
      </div>
    </div>
  );
}
