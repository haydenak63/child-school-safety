import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, studentSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const student = await prisma.student.findFirst({
      where: { id, schoolId: session.schoolId },
      include: {
        parents: { include: { parent: true } },
        fingerprints: { select: { id: true, finger: true, createdAt: true } },
        attendance: {
          take: 8,
          orderBy: { timestamp: "desc" },
          include: { terminal: true },
        },
      },
    });
    if (!student) throw new AppError("NOT_FOUND", "Student not found.", 404);
    return Response.json({
      student: {
        ...student,
        fingerprintEnrolled: student.fingerprints.length > 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = parseBody(studentSchema.partial(), await readJson(request));
    const student = await prisma.student.findFirst({
      where: { id, schoolId: session.schoolId },
    });
    if (!student) throw new AppError("NOT_FOUND", "Student not found.", 404);

    const updated = await prisma.student.update({
      where: { id },
      data: {
        studentNumber: body.studentNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        photo: body.photo === "" ? null : body.photo,
        className: body.className,
        section: body.section,
        status: body.status,
      },
    });
    return Response.json({ student: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const student = await prisma.student.findFirst({
      where: { id, schoolId: session.schoolId },
    });
    if (!student) throw new AppError("NOT_FOUND", "Student not found.", 404);
    await prisma.student.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    return Response.json({ ok: true, status: "INACTIVE" });
  } catch (error) {
    return errorResponse(error);
  }
}
