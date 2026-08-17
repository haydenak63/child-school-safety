import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { fullName } from "@/lib/names";
import { formatTime } from "@/lib/dates";
import { StudentDetailActions } from "@/components/student-detail-actions";
import { Avatar, Badge, Card, PageHeader } from "@/components/ui/primitives";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await requireAdminPage();
  const { id } = await params;
  const query = await searchParams;
  const student = await prisma.student.findFirst({
    where: { id, schoolId: session.schoolId },
    include: {
      parents: { include: { parent: true }, orderBy: { isPrimary: "desc" } },
      fingerprints: { select: { id: true, finger: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!student) notFound();

  const school = await prisma.school.findUniqueOrThrow({ where: { id: session.schoolId } });
  const attendance = await prisma.attendanceEvent.findMany({
    where: { studentId: student.id },
    include: { terminal: true },
    orderBy: { timestamp: "desc" },
    take: 8,
  });

  const enrolled = student.fingerprints.length > 0;
  const lastPrint = student.fingerprints[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {query.created === "1" ? (
        <div className="rounded-2xl border border-ok/20 bg-ok-soft px-4 py-3 text-sm text-ok">
          Student created. Enroll a fingerprint next.
        </div>
      ) : null}

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={fullName(student)} />
            <div>
              <PageHeader title={fullName(student)} />
              <p className="mt-1 text-sm text-ink-muted">
                {student.className} · Section {student.section} · #{student.studentNumber}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={student.status === "ACTIVE" ? "ok" : "warn"}>{student.status}</Badge>
                <Badge tone={enrolled ? "ok" : "warn"}>{enrolled ? "✓ Enrolled" : "Fingerprint not enrolled"}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <StudentDetailActions
            student={{
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              className: student.className,
              section: student.section,
              studentNumber: student.studentNumber,
              status: student.status,
              fingerprintEnrolled: enrolled,
              parents: student.parents,
            }}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Parents / guardians</h2>
          <div className="mt-4 space-y-4">
            {student.parents.map((link) => (
              <div key={link.parent.id}>
                <p className="font-medium">{link.parent.name}</p>
                <p className="text-sm text-ink-muted">
                  {link.parent.relationship}
                  {link.isPrimary ? " · Primary" : ""}
                </p>
                <p className="mt-1 text-sm">{link.parent.whatsappNumber}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-base font-semibold">Biometric status</h2>
          <p className="mt-3 text-lg font-semibold">{enrolled ? "✓ Enrolled" : "Not enrolled"}</p>
          <p className="mt-2 text-sm text-ink-muted">
            {lastPrint
              ? `Last updated ${formatTime(lastPrint.createdAt, school.timezone)}`
              : "No fingerprint template stored yet."}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Attendance history</h2>
        {attendance.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No attendance events yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {attendance.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{event.eventType}</p>
                  <p className="text-ink-muted">{event.terminal.name}</p>
                </div>
                <p className="text-ink-muted">{formatTime(event.timestamp, school.timezone)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
