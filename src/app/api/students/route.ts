import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, studentSchema, parentSchema } from "@/lib/validation";

const createSchema = studentSchema.extend({
  parent: parentSchema.optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    const students = await prisma.student.findMany({
      where: { schoolId: session.schoolId },
      include: {
        parents: { include: { parent: true } },
        fingerprints: { select: { id: true, finger: true, createdAt: true } },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return Response.json({
      students: students.map((student) => ({
        ...student,
        fingerprintEnrolled: student.fingerprints.length > 0,
        fingerprints: student.fingerprints,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const body = parseBody(createSchema, await readJson(request));

    const existing = await prisma.student.findFirst({
      where: { schoolId: session.schoolId, studentNumber: body.studentNumber },
    });
    if (existing) {
      throw new AppError("VALIDATION", "A student with this number already exists.");
    }

    const student = await prisma.student.create({
      data: {
        schoolId: session.schoolId,
        studentNumber: body.studentNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        photo: body.photo || null,
        className: body.className,
        section: body.section,
        status: body.status ?? "ACTIVE",
      },
    });

    if (body.parent) {
      const parent = await prisma.parent.create({
        data: {
          schoolId: session.schoolId,
          name: body.parent.name,
          relationship: body.parent.relationship,
          whatsappNumber: body.parent.whatsappNumber,
        },
      });
      await prisma.studentParent.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          isPrimary: body.parent.isPrimary ?? true,
        },
      });
    }

    const created = await prisma.student.findUnique({
      where: { id: student.id },
      include: { parents: { include: { parent: true } }, fingerprints: true },
    });
    return Response.json({ student: created }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
