import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, assignPlanSchema } from "@/lib/validation";
import { assignPlan, ensureSchoolSubscription, schoolUsage } from "@/lib/services/billing";
import { isPlatformOperator } from "@/lib/services/platform";
import { planById } from "@/lib/billing/plans";

export async function GET() {
  try {
    const session = await requireSession();
    const [subscription, usage, operator] = await Promise.all([
      ensureSchoolSubscription(session.schoolId),
      schoolUsage(session.schoolId),
      isPlatformOperator(session.adminId),
    ]);
    return Response.json({
      subscription,
      usage,
      plan: planById(subscription.plan),
      operator,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const body = parseBody(assignPlanSchema, await readJson(request));
    const operator = await isPlatformOperator(session.adminId);
    const subscription = await assignPlan({
      schoolId: session.schoolId,
      plan: body.plan,
      manual: Boolean(body.manual && operator),
    });
    return Response.json({ subscription, plan: planById(subscription.plan) });
  } catch (error) {
    return errorResponse(error);
  }
}
