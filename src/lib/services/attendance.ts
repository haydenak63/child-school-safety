import { AppError } from "@/lib/errors";
import { formatTime, formatTimeShort } from "@/lib/dates";
import { isWithinCooldown, remainingCooldownSeconds, resolveEventType } from "@/lib/attendance/logic";
import { sendAttendanceNotification } from "@/lib/notifications/service";
import type { ArrivalNotificationInput } from "@/lib/notifications/types";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/names";
import { todayRange } from "@/lib/services/school-day";

export async function recordAttendanceEvent(options: {
  schoolId: string;
  studentId: string;
  terminalId: string;
  confidence: number;
}) {
  const [student, terminal, school] = await Promise.all([
    prisma.student.findFirst({
      where: { id: options.studentId, schoolId: options.schoolId, status: "ACTIVE" },
      include: {
        parents: { include: { parent: true }, orderBy: { isPrimary: "desc" } },
      },
    }),
    prisma.terminal.findFirst({
      where: { id: options.terminalId, schoolId: options.schoolId, status: "ACTIVE" },
    }),
    prisma.school.findUnique({ where: { id: options.schoolId } }),
  ]);

  if (!student || !terminal || !school) {
    throw new AppError("NOT_FOUND", "Student or terminal was not found.", 404);
  }

  const now = new Date();
  const lastAny = await prisma.attendanceEvent.findFirst({
    where: { studentId: student.id },
    orderBy: { timestamp: "desc" },
  });

  if (isWithinCooldown(lastAny?.timestamp, now, school.scanCooldownSeconds)) {
    throw new AppError(
      "COOLDOWN",
      `Duplicate scan ignored. Wait ${remainingCooldownSeconds(lastAny!.timestamp, now, school.scanCooldownSeconds)} seconds.`,
      429,
      {
        cooldownSeconds: remainingCooldownSeconds(lastAny!.timestamp, now, school.scanCooldownSeconds),
        lastEventType: lastAny?.eventType,
      },
    );
  }

  const { start, end } = todayRange(school.timezone, now);
  const lastToday = await prisma.attendanceEvent.findFirst({
    where: { studentId: student.id, timestamp: { gte: start, lt: end } },
    orderBy: { timestamp: "desc" },
  });

  const eventType = resolveEventType(lastToday?.eventType ?? null);
  const event = await prisma.attendanceEvent.create({
    data: {
      studentId: student.id,
      terminalId: terminal.id,
      eventType,
      confidence: options.confidence,
      timestamp: now,
    },
  });

  await prisma.terminal.update({
    where: { id: terminal.id },
    data: { lastActivityAt: now },
  });

  const parent = student.parents[0]?.parent;
  let notification = null;
  if (parent) {
    const payload: ArrivalNotificationInput = {
      eventId: event.id,
      studentName: fullName(student),
      studentReference: student.studentNumber,
      schoolName: school.name,
      schoolTimezone: school.timezone,
      occurredAt: now,
      time: formatTimeShort(now, school.timezone),
      gate: terminal.name,
      recipients: [{ name: parent.name, phone: parent.whatsappNumber }],
    };
    const draft = await sendAttendanceNotification(school.id, eventType, payload);

    notification = await prisma.notificationLog.create({
      data: {
        studentId: student.id,
        attendanceEventId: event.id,
        channel: draft.channel,
        recipient: draft.recipient,
        message: draft.message,
        status: draft.status,
        sentAt: now,
      },
    });
  }

  return {
    eventType,
    confidence: options.confidence,
    timestamp: now.toISOString(),
    timeLabel: formatTime(now, school.timezone),
    student: {
      id: student.id,
      name: fullName(student),
      className: student.className,
      section: student.section,
    },
    terminal: {
      name: terminal.name,
      location: terminal.location,
    },
    notification: notification
      ? {
          recipient: notification.recipient,
          message: notification.message,
          status: notification.status,
        }
      : null,
  };
}
