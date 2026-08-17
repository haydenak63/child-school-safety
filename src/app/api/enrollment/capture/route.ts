import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { hashToken } from "@/lib/crypto";
import { captureSchema, parseBody } from "@/lib/validation";
import { assertEnrollmentUsable } from "@/lib/services/enrollment";
import { enrollFingerprintFromCapture } from "@/lib/services/biometric";
import { z } from "zod";

const schema = captureSchema.extend({
  token: z.string().min(16),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const limited = rateLimit(clientKey(request, "enroll-capture"), 12, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many enrollment attempts. Please wait and try again.", 429);
    }

    const body = parseBody(schema, await readJson(request));
    const enrollment = await prisma.enrollmentSession.findUnique({
      where: { tokenHash: hashToken(body.token) },
      include: { student: true },
    });
    if (!enrollment) {
      throw new AppError("NOT_FOUND", "Enrollment session was not found.", 404);
    }
    assertEnrollmentUsable(enrollment);

    const result = await enrollFingerprintFromCapture({
      studentId: enrollment.studentId,
      image: body.image,
      finger: body.finger,
    });

    await prisma.enrollmentSession.update({
      where: { id: enrollment.id },
      data: { usedAt: new Date() },
    });

    return Response.json({
      ok: true,
      message: "Fingerprint enrolled successfully",
      student: {
        name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      },
      ...result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
