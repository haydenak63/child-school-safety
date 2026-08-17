import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { issueEmailVerification } from "@/lib/auth/email-tokens";
import { authRedirect, readAuthPayload, withQuery } from "@/lib/auth/request";
import { AppError, errorResponse } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ensureSchoolSubscription } from "@/lib/services/billing";
import { parseBody, registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "register"), 5, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many registration attempts. Please wait and try again.", 429);
    }

    const payload = await readAuthPayload(request);
    let body: ReturnType<typeof registerSchema.parse>;
    try {
      body = parseBody(registerSchema, payload.data);
    } catch (error) {
      if (payload.isForm && error instanceof AppError) {
        return authRedirect(request, withQuery("/register", { error: error.message }));
      }
      throw error;
    }

    const email = body.email.toLowerCase();
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      const message = "An account with this email already exists. Sign in or reset your password.";
      if (payload.isForm) {
        return authRedirect(request, withQuery("/register", { error: message }));
      }
      throw new AppError("VALIDATION", message);
    }

    const passwordHash = await hashPassword(body.password);
    const created = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: body.schoolName,
          address: body.address?.trim() || "—",
          timezone: body.timezone?.trim() || "Asia/Karachi",
        },
      });
      const admin = await tx.admin.create({
        data: {
          schoolId: school.id,
          email,
          passwordHash,
          name: body.ownerName,
          platformOperator: false,
        },
      });
      return { school, admin };
    });

    await ensureSchoolSubscription(created.school.id);
    const mail = await issueEmailVerification({
      id: created.admin.id,
      email: created.admin.email,
      name: created.admin.name,
      school: { name: created.school.name },
    });

    if (payload.isForm) {
      return authRedirect(
        request,
        withQuery("/check-email", {
          reason: "register",
          mail: mail.mailStatus === "SENT" ? undefined : mail.mailStatus.toLowerCase(),
        }),
      );
    }
    return NextResponse.json({
      ok: true,
      mail: mail.mailStatus,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
