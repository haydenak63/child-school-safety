import { NextRequest, NextResponse } from "next/server";
import { issueEmailVerification } from "@/lib/auth/email-tokens";
import { authFormRedirect, authRedirect, readAuthPayload, withQuery } from "@/lib/auth/request";
import { AppError, errorResponse } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { parseBody, resendVerificationSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "resend-verification"), 3, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many verification emails. Please wait and try again.", 429);
    }

    const payload = await readAuthPayload(request);
    let body: ReturnType<typeof resendVerificationSchema.parse>;
    try {
      body = parseBody(resendVerificationSchema, payload.data);
    } catch (error) {
      if (payload.isForm && error instanceof AppError) {
        return authRedirect(
          request,
          withQuery("/login", { error: error.message, unverified: "1" }),
        );
      }
      throw error;
    }

    const admin = await prisma.admin.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { school: true },
    });
    if (admin && !admin.emailVerifiedAt) {
      await issueEmailVerification({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        school: { name: admin.school.name },
      });
    }

    if (payload.isForm) {
      return authRedirect(request, withQuery("/check-email", { reason: "resend" }));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (request.headers.get("content-type")?.includes("application/json")) {
      return errorResponse(error);
    }
    return authFormRedirect(request, "/login", error, { unverified: "1" });
  }
}
