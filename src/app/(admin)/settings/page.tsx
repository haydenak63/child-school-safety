import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { SettingsForm } from "@/components/settings-form";
import { Card } from "@/components/ui/primitives";

export default async function SchoolSettingsPage() {
  const session = await requireAdminPage();
  const school = await prisma.school.findUniqueOrThrow({ where: { id: session.schoolId } });

  return (
    <div className="space-y-4">
      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <h2 className="text-[15px] font-semibold">School profile</h2>
        <p className="mt-1 text-[13px] text-ink-muted">These values are used in attendance and notifications.</p>
        <div className="mt-5">
          <SettingsForm school={school} />
        </div>
      </Card>
      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <h2 className="text-[15px] font-semibold">Account</h2>
        <p className="mt-2 text-[13px] text-ink-muted">{session.email}</p>
        <p className="mt-1 text-[13px] text-ink-muted">{session.name}</p>
      </Card>
      <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
        <h2 className="text-[15px] font-semibold">Security</h2>
        <p className="mt-2 text-[13px] leading-6 text-ink-muted">
          Fingerprint templates are never displayed. Enrollment tokens expire and terminal URLs can
          be revoked.
        </p>
      </Card>
    </div>
  );
}
