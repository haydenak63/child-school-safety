import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { createSecureToken, hashToken } from "@/lib/crypto";
import { cameraPageOrigin } from "@/lib/env";
import { qrDataUrl } from "@/lib/qr";
import { ENROLLMENT_TTL_MS } from "@/lib/services/enrollment";
import { z } from "zod";

const schema = z.object({ studentId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const { studentId } = schema.parse(await readJson(request));

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId: session.schoolId },
    });
    if (!student) throw new AppError("NOT_FOUND", "Student not found.", 404);

    const token = createSecureToken();
    const expiresAt = new Date(Date.now() + ENROLLMENT_TTL_MS);
    await prisma.enrollmentSession.create({
      data: {
        studentId: student.id,
        tokenHash: hashToken(token),
        expiresAt,
      },
    });

    const url = `${cameraPageOrigin(request)}/enroll/${token}`;
    return Response.json({
      url,
      expiresAt: expiresAt.toISOString(),
      qrDataUrl: await qrDataUrl(url),
      student: {
        name: `${student.firstName} ${student.lastName}`,
        className: student.className,
        section: student.section,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
