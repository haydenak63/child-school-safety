import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { fullName } from "@/lib/names";
import { ParentDirectory } from "@/components/parents/parent-directory";
import { PageHeader } from "@/components/ui/primitives";

export default async function ParentsPage() {
  const session = await requireAdminPage();
  const parents = await prisma.parent.findMany({
    where: { schoolId: session.schoolId },
    include: { students: { include: { student: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Parents" description="Guardians associated with enrolled students." />
      <ParentDirectory
        parents={parents.map((parent) => ({
          id: parent.id,
          name: parent.name,
          relationship: parent.relationship,
          whatsappNumber: parent.whatsappNumber,
          students: parent.students.map((link) => fullName(link.student)),
        }))}
      />
    </div>
  );
}
