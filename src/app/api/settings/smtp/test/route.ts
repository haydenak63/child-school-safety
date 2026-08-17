import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { sendTransactionalEmail } from "@/lib/email/mailer";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { requirePlatformOperator } from "@/lib/services/platform";
import { parseBody, smtpTestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await requirePlatformOperator(session.adminId);
    assertSameOrigin(request);

    const limited = rateLimit(clientKey(request, "smtp-test"), 5, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many test emails. Please wait and try again.", 429);
    }

    const body = parseBody(smtpTestSchema, await readJson(request));
    const to = body.to?.trim() || session.email;
    const result = await sendTransactionalEmail({
      to,
      subject: "CSS SMTP test",
      html: "<p>If you received this, outbound email from CSS is working.</p>",
      text: "If you received this, outbound email from CSS is working.",
      template: "smtp-test",
    });

    if (result.status === "SKIPPED") {
      throw new AppError(
        "VALIDATION",
        "SMTP is not configured. Enable SMTP and save a host and password, or set SMTP_HOST in the environment.",
      );
    }
    if (result.status === "FAILED") {
      throw new AppError("NETWORK", result.error ?? "The test email could not be sent.", 502);
    }

    return Response.json({ ok: true, to });
  } catch (error) {
    return errorResponse(error);
  }
}
