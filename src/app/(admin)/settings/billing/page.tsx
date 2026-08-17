import { requireAdminPage } from "@/lib/auth/guards";
import { ensureSchoolSubscription, schoolUsage } from "@/lib/services/billing";
import { getPlatformSettings, isPlatformOperator } from "@/lib/services/platform";
import { planById } from "@/lib/billing/plans";
import { BillingBoard } from "@/components/settings/billing-board";

export default async function BillingPage() {
  const session = await requireAdminPage();
  const [subscription, usage, platform, operator] = await Promise.all([
    ensureSchoolSubscription(session.schoolId),
    schoolUsage(session.schoolId),
    getPlatformSettings(),
    isPlatformOperator(session.adminId),
  ]);

  return (
    <BillingBoard
      subscription={{
        plan: subscription.plan,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        assignedManually: subscription.assignedManually,
      }}
      usage={usage}
      catalogPlan={planById(subscription.plan)}
      billingEnabled={platform.billingEnabled}
      operator={operator}
    />
  );
}
