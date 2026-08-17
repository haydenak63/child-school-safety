import { AdminShell } from "@/components/admin-shell";
import { CommandPalette } from "@/components/layout/command-palette";
import { requireAdminPage } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  const school = await prisma.school.findUnique({ where: { id: session.schoolId } });

  return (
    <AdminShell schoolName={school?.name ?? "School"} adminName={session.name}>
      <CommandPalette />
      {children}
    </AdminShell>
  );
}
