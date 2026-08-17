import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { notificationService } from "@/lib/notifications/service";
import { z } from "zod";

const schema = z.object({
  studentId: z.string().min(1).optional(),
  eventType: z.enum(["ARRIVAL", "DEPARTURE"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const body = schema.parse(await readJson(request));
    const school = await prisma.school.findUnique({ where: { id: session.schoolId } });
    const student = body.studentId
      ? await prisma.student.findFirst({
          where: { id: body.studentId, schoolId: session.schoolId },
          include: { parents: { include: { parent: true } } },
        })
      : await prisma.student.findFirst({
          where: { schoolId: session.schoolId },
          include: { parents: { include: { parent: true } } },
        });

    const recipient = student?.parents[0]?.parent.whatsappNumber ?? "+920000000000";
    const payload = {
      studentName: student ? `${student.firstName} ${student.lastName}` : "Ali Ahmed",
      schoolName: school?.name ?? "ABC International School",
      time: "08:42 AM",
      gate: "Main Entrance",
      recipient,
    };

    const draft =
      (body.eventType ?? "ARRIVAL") === "DEPARTURE"
        ? await notificationService.sendDepartureNotification(payload)
        : await notificationService.sendArrivalNotification(payload);

    return Response.json({ notification: draft });
  } catch (error) {
    return errorResponse(error);
  }
}
