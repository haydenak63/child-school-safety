import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { formatTime } from "@/lib/dates";
import { fullName } from "@/lib/names";
import { AttendanceFilters } from "@/components/attendance-filters";
import { AttendanceList } from "@/components/attendance/attendance-list";
import { PageHeader } from "@/components/ui/primitives";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminPage();
  const school = await prisma.school.findUniqueOrThrow({ where: { id: session.schoolId } });
  const params = await searchParams;
  const date = typeof params.date === "string" ? params.date : "";
  const studentId = typeof params.studentId === "string" ? params.studentId : "";
  const terminalId = typeof params.terminalId === "string" ? params.terminalId : "";
  const eventType = typeof params.eventType === "string" ? params.eventType : "";

  const students = await prisma.student.findMany({
    where: { schoolId: session.schoolId },
    orderBy: { firstName: "asc" },
  });
  const terminals = await prisma.terminal.findMany({
    where: { schoolId: session.schoolId },
    orderBy: { name: "asc" },
  });

  const where: Record<string, unknown> = { student: { schoolId: session.schoolId } };
  if (studentId) where.studentId = studentId;
  if (terminalId) where.terminalId = terminalId;
  if (eventType === "ARRIVAL" || eventType === "DEPARTURE") where.eventType = eventType;
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    where.timestamp = { gte: start, lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
  }

  const events = await prisma.attendanceEvent.findMany({
    where,
    include: { student: true, terminal: true },
    orderBy: { timestamp: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Attendance" description="Monitor student arrivals and departures." />
      <Suspense>
        <AttendanceFilters students={students} terminals={terminals} />
      </Suspense>
      <AttendanceList
        events={events.map((event) => ({
          id: event.id,
          time: formatTime(event.timestamp, school.timezone),
          student: fullName(event.student),
          eventType: event.eventType,
          terminal: event.terminal.name,
          confidence: Math.round(event.confidence * 100),
        }))}
      />
    </div>
  );
}
