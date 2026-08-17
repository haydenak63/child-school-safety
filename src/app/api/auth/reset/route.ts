import { NextRequest, NextResponse } from "next/server";
import { consumePasswordReset } from "@/lib/auth/email-tokens";
import { authRedirect, readAuthPayload, withQuery } from "@/lib/auth/request";
import { AppError, errorResponse } from "@/lib/errors";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { parseBody, resetPasswordSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "reset"), 8, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many reset attempts. Please wait and try again.", 429);
    }

    const payload = await readAuthPayload(request);
    let body: ReturnType<typeof resetPasswordSchema.parse>;
    try {
      body = parseBody(resetPasswordSchema, payload.data);
    } catch (error) {
      if (payload.isForm && error instanceof AppError) {
        const token = String(payload.data.token ?? "");
        return authRedirect(
          request,
          withQuery(`/reset-password/${token}`, { error: error.message }),
        );
      }
      throw error;
    }

    try {
      await consumePasswordReset(body.token, body.password);
    } catch (error) {
      if (payload.isForm && error instanceof AppError) {
        return authRedirect(
          request,
          withQuery(`/reset-password/${body.token}`, { error: error.message }),
        );
      }
      throw error;
    }

    if (payload.isForm) {
      return authRedirect(
        request,
        withQuery("/login", { notice: "Password updated. Sign in with your new password." }),
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
