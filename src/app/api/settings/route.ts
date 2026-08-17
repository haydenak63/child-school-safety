import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, settingsSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireSession();
    const school = await prisma.school.findUnique({ where: { id: session.schoolId } });
    return Response.json({ school });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const body = parseBody(settingsSchema, await readJson(request));
    const school = await prisma.school.update({
      where: { id: session.schoolId },
      data: body,
    });
    return Response.json({ school });
  } catch (error) {
    return errorResponse(error);
  }
}
