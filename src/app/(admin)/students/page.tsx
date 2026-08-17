import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { Button, PageHeader } from "@/components/ui/primitives";
import { StudentDirectory } from "@/components/students/student-directory";
import { fullName } from "@/lib/names";

export default async function StudentsPage() {
  const session = await requireAdminPage();
  const students = await prisma.student.findMany({
    where: { schoolId: session.schoolId },
    include: {
      fingerprints: { select: { id: true } },
      parents: { include: { parent: true } },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Students"
        description="Enroll students and capture fingerprints."
        actions={<Button href="/students/new">Add student</Button>}
      />
      <StudentDirectory
        students={students.map((student) => ({
          id: student.id,
          name: fullName(student),
          studentNumber: student.studentNumber,
          className: student.className,
          section: student.section,
          status: student.status,
          enrolled: student.fingerprints.length > 0,
          parent: student.parents[0]?.parent.name ?? "—",
        }))}
      />
    </div>
  );
}
