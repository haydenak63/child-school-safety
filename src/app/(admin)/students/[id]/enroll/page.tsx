import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { fullName } from "@/lib/names";
import { EnrollmentQr } from "@/components/enrollment-qr";
import { PageHeader } from "@/components/ui/primitives";

export default async function EnrollStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminPage();
  const { id } = await params;
  const student = await prisma.student.findFirst({
    where: { id, schoolId: session.schoolId },
  });
  if (!student) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Enrollment"
        title="Fingerprint enrollment"
        description="Generate a one-time QR code. The template is never shown in this interface."
      />
      <EnrollmentQr
        studentId={student.id}
        studentName={fullName(student)}
        classLabel={`${student.className} · Section ${student.section}`}
      />
    </div>
  );
}
