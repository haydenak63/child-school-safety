import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { requireTerminal } from "@/lib/services/terminals";
import { recordAttendanceEvent } from "@/lib/services/attendance";
import { z } from "zod";

const createSchema = z.object({
  terminalToken: z.string().min(16),
  studentId: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");
    const terminalId = searchParams.get("terminalId");
    const eventType = searchParams.get("eventType");

    const where: Record<string, unknown> = {
      student: { schoolId: session.schoolId },
    };
    if (studentId) where.studentId = studentId;
    if (terminalId) where.terminalId = terminalId;
    if (eventType === "ARRIVAL" || eventType === "DEPARTURE") where.eventType = eventType;
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.timestamp = { gte: start, lt: end };
    }

    const events = await prisma.attendanceEvent.findMany({
      where,
      include: { student: true, terminal: true },
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    return Response.json({
      events: events.map((event) => ({
        id: event.id,
        time: event.timestamp,
        student: `${event.student.firstName} ${event.student.lastName}`,
        studentId: event.studentId,
        eventType: event.eventType,
        terminal: event.terminal.name,
        confidence: event.confidence,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = createSchema.parse(await readJson(request));
    const terminal = await requireTerminal(body.terminalToken);
    const result = await recordAttendanceEvent({
      schoolId: terminal.schoolId,
      studentId: body.studentId,
      terminalId: terminal.id,
      confidence: body.confidence,
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
