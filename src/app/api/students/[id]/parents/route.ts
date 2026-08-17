import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, parentSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = parseBody(parentSchema, await readJson(request));

    const student = await prisma.student.findFirst({
      where: { id, schoolId: session.schoolId },
    });
    if (!student) throw new AppError("NOT_FOUND", "Student not found.", 404);

    const parent = await prisma.parent.create({
      data: {
        schoolId: session.schoolId,
        name: body.name,
        relationship: body.relationship,
        whatsappNumber: body.whatsappNumber,
      },
    });

    await prisma.studentParent.create({
      data: {
        studentId: student.id,
        parentId: parent.id,
        isPrimary: body.isPrimary ?? false,
      },
    });

    return Response.json({ parent }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
