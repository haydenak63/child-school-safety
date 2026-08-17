import { NextRequest, NextResponse } from "next/server";
import { issuePasswordReset } from "@/lib/auth/email-tokens";
import { authRedirect, readAuthPayload, withQuery } from "@/lib/auth/request";
import { AppError, errorResponse } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema, parseBody } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "forgot"), 5, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many reset requests. Please wait and try again.", 429);
    }

    const payload = await readAuthPayload(request);
    let body: ReturnType<typeof forgotPasswordSchema.parse>;
    try {
      body = parseBody(forgotPasswordSchema, payload.data);
    } catch (error) {
      if (payload.isForm && error instanceof AppError) {
        return authRedirect(request, withQuery("/forgot-password", { error: error.message }));
      }
      throw error;
    }

    const admin = await prisma.admin.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { school: true },
    });
    if (admin) {
      await issuePasswordReset({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        school: { name: admin.school.name },
      });
    }

    if (payload.isForm) {
      return authRedirect(request, withQuery("/check-email", { reason: "forgot" }));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
