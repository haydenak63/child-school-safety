import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { resolveNotificationService } from "@/lib/notifications/service";
import type { ArrivalNotificationInput } from "@/lib/notifications/types";
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

    const parent = student?.parents[0]?.parent;
    const payload: ArrivalNotificationInput = {
      eventId: `csspreview_${randomUUID()}`,
      studentName: student ? `${student.firstName} ${student.lastName}` : "Ali Ahmed",
      studentReference: student?.studentNumber ?? "STU-001",
      schoolName: school?.name ?? "ABC International School",
      schoolTimezone: school?.timezone ?? "Asia/Karachi",
      occurredAt: new Date(),
      time: "08:42 AM",
      gate: "Main Entrance",
      recipients: [
        {
          name: parent?.name ?? "Parent",
          phone: parent?.whatsappNumber ?? "+920000000000",
        },
      ],
    };

    const service = await resolveNotificationService(session.schoolId);
    const draft =
      (body.eventType ?? "ARRIVAL") === "DEPARTURE"
        ? await service.sendDepartureNotification(payload)
        : await service.sendArrivalNotification(payload);

    return Response.json({ notification: draft });
  } catch (error) {
    return errorResponse(error);
  }
}
