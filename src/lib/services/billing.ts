import type { BillingPlan, SchoolSubscription } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { planById } from "@/lib/billing/plans";
import { configuredGateways, getPlatformSettings } from "@/lib/services/platform";

export async function ensureSchoolSubscription(schoolId: string): Promise<SchoolSubscription> {
  const existing = await prisma.schoolSubscription.findUnique({ where: { schoolId } });
  if (existing) return existing;

  const settings = await getPlatformSettings();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + settings.trialDays);

  return prisma.schoolSubscription.create({
    data: {
      schoolId,
      plan: "STARTER",
      status: "TRIALING",
      trialEndsAt,
      assignedManually: true,
    },
  });
}

export async function schoolUsage(schoolId: string) {
  const [students, terminals, parents] = await Promise.all([
    prisma.student.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.terminal.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.parent.count({ where: { schoolId } }),
  ]);
  return { students, terminals, parents };
}

export async function assignPlan(options: {
  schoolId: string;
  plan: BillingPlan;
  manual: boolean;
}): Promise<SchoolSubscription> {
  const settings = await getPlatformSettings();
  if (!options.manual && !settings.billingEnabled) {
    throw new AppError(
      "BILLING_DISABLED",
      "Payment collection is not enabled yet. A platform operator can assign a plan manually, or turn payments on once a gateway is configured.",
      409,
    );
  }

  if (!options.manual && configuredGateways(settings).length === 0) {
    throw new AppError(
      "BILLING_DISABLED",
      "No payment gateway is configured. Add Stripe, PayPak, or JazzCash credentials first.",
      409,
    );
  }

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return prisma.schoolSubscription.upsert({
    where: { schoolId: options.schoolId },
    create: {
      schoolId: options.schoolId,
      plan: options.plan,
      status: options.manual ? "ACTIVE" : "ACTIVE",
      currentPeriodEnd: periodEnd,
      trialEndsAt: null,
      assignedManually: options.manual,
    },
    update: {
      plan: options.plan,
      status: "ACTIVE",
      currentPeriodEnd: periodEnd,
      trialEndsAt: null,
      assignedManually: options.manual,
    },
  });
}

export function withinPlanLimits(
  subscription: SchoolSubscription,
  usage: { students: number; terminals: number },
) {
  const plan = planById(subscription.plan);
  return {
    studentsOk: plan.studentLimit === null || usage.students <= plan.studentLimit,
    terminalsOk: plan.terminalLimit === null || usage.terminals <= plan.terminalLimit,
  };
}
