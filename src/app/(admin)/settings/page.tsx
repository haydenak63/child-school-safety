import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { SettingsForm } from "@/components/settings-form";
import { isDemoMode } from "@/lib/env";
import { Card, PageHeader } from "@/components/ui/primitives";

export default async function SettingsPage() {
  const session = await requireAdminPage();
  const school = await prisma.school.findUniqueOrThrow({ where: { id: session.schoolId } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="School profile, terminal preferences, and prototype security notes."
      />
      <Card className="p-6">
        <h2 className="text-base font-semibold">School profile</h2>
        <p className="mt-1 text-sm text-ink-muted">These values are used in attendance and notifications.</p>
        <div className="mt-5">
          <SettingsForm school={school} />
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-base font-semibold">Account</h2>
        <p className="mt-2 text-sm text-ink-muted">{session.email}</p>
        <p className="mt-1 text-sm text-ink-muted">{session.name}</p>
      </Card>
      <Card className="p-6">
        <h2 className="text-base font-semibold">Security</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Camera fingerprint matching is a prototype. Templates are never displayed. Enrollment
          tokens expire and terminal URLs can be revoked.
        </p>
      </Card>
      {isDemoMode() ? (
        <Link href="/settings/diagnostics" className="block">
          <Card className="border-warn/20 bg-warn-soft p-5 text-sm text-warn">
            Open development-only biometric diagnostics
          </Card>
        </Link>
      ) : null}
    </div>
  );
}
