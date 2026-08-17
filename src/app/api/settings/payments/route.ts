import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, platformBillingSchema } from "@/lib/validation";
import {
  encryptIfPresent,
  getPlatformSettings,
  requirePlatformOperator,
  toGatewayPublicView,
} from "@/lib/services/platform";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireSession();
    await requirePlatformOperator(session.adminId);
    const settings = await getPlatformSettings();
    return Response.json({ settings: toGatewayPublicView(settings) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    await requirePlatformOperator(session.adminId);
    assertSameOrigin(request);
    const body = parseBody(platformBillingSchema, await readJson(request));

    const stripeSecret = encryptIfPresent(body.stripeSecret);
    const stripeWebhook = encryptIfPresent(body.stripeWebhookSecret);
    const paypakSecret = encryptIfPresent(body.paypakSecret);
    const jazzcashPassword = encryptIfPresent(body.jazzcashPassword);
    const jazzcashIntegrity = encryptIfPresent(body.jazzcashIntegrity);

    const current = await getPlatformSettings();
    const next = await prisma.platformSettings.update({
      where: { id: current.id },
      data: {
        billingEnabled: body.billingEnabled,
        trialDays: body.trialDays,
        stripeEnabled: body.stripeEnabled,
        stripeMode: body.stripeMode,
        stripePublishableKey: body.stripePublishableKey || null,
        ...(stripeSecret.encrypted
          ? { stripeSecretEncrypted: stripeSecret.encrypted, stripeSecretHint: stripeSecret.hint }
          : {}),
        ...(stripeWebhook.encrypted
          ? {
              stripeWebhookSecretEncrypted: stripeWebhook.encrypted,
              stripeWebhookHint: stripeWebhook.hint,
            }
          : {}),
        paypakEnabled: body.paypakEnabled,
        paypakMerchantId: body.paypakMerchantId || null,
        paypakApiUrl: body.paypakApiUrl || null,
        ...(paypakSecret.encrypted
          ? { paypakSecretEncrypted: paypakSecret.encrypted, paypakSecretHint: paypakSecret.hint }
          : {}),
        jazzcashEnabled: body.jazzcashEnabled,
        jazzcashMerchantId: body.jazzcashMerchantId || null,
        ...(jazzcashPassword.encrypted
          ? {
              jazzcashPasswordEncrypted: jazzcashPassword.encrypted,
              jazzcashPasswordHint: jazzcashPassword.hint,
            }
          : {}),
        ...(jazzcashIntegrity.encrypted
          ? {
              jazzcashIntegrityEncrypted: jazzcashIntegrity.encrypted,
              jazzcashIntegrityHint: jazzcashIntegrity.hint,
            }
          : {}),
      },
    });

    return Response.json({ settings: toGatewayPublicView(next) });
  } catch (error) {
    return errorResponse(error);
  }
}
