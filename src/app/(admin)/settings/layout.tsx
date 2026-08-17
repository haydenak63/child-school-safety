import { SettingsTabs } from "@/components/settings/settings-tabs";
import { requireAdminPage } from "@/lib/auth/guards";
import { isPlatformOperator } from "@/lib/services/platform";
import { PageHeader } from "@/components/ui/primitives";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  const operator = await isPlatformOperator(session.adminId);

  const tabs = [
    { href: "/settings", label: "School", exact: true },
    { href: "/settings/integrations", label: "Integrations" },
    { href: "/settings/billing", label: "Billing" },
    ...(operator ? [{ href: "/settings/payments", label: "Payments" }] : []),
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Settings"
        description="School profile, parent messaging, billing, and platform credentials."
      />
      <SettingsTabs tabs={tabs} />
      {children}
    </div>
  );
}
