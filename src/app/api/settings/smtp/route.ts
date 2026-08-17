import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, smtpSettingsSchema } from "@/lib/validation";
import {
  encryptIfPresent,
  getPlatformSettings,
  requirePlatformOperator,
  toGatewayPublicView,
} from "@/lib/services/platform";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    await requirePlatformOperator(session.adminId);
    assertSameOrigin(request);
    const body = parseBody(smtpSettingsSchema, await readJson(request));
    const password = encryptIfPresent(body.smtpPassword);
    const current = await getPlatformSettings();
    const next = await prisma.platformSettings.update({
      where: { id: current.id },
      data: {
        smtpEnabled: body.smtpEnabled,
        smtpHost: body.smtpHost || null,
        smtpPort: body.smtpPort,
        smtpUser: body.smtpUser || null,
        smtpFrom: body.smtpFrom || null,
        ...(password.encrypted
          ? { smtpPassEncrypted: password.encrypted, smtpPassHint: password.hint }
          : {}),
      },
    });
    return Response.json({ settings: toGatewayPublicView(next) });
  } catch (error) {
    return errorResponse(error);
  }
}
