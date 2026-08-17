import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const session = await requireSession();
    const parents = await prisma.parent.findMany({
      where: { schoolId: session.schoolId },
      include: {
        students: { include: { student: true } },
      },
      orderBy: { name: "asc" },
    });
    return Response.json({ parents });
  } catch (error) {
    return errorResponse(error);
  }
}
