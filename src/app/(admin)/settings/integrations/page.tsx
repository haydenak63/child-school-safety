import { requireAdminPage } from "@/lib/auth/guards";
import { getSchoolIntegration } from "@/lib/services/integrations";
import { getPlatformSettings, isPlatformOperator, toGatewayPublicView } from "@/lib/services/platform";
import { IqPigeonIntegration } from "@/components/settings/iq-pigeon-integration";
import { ExtraIntegrations } from "@/components/settings/extra-integrations";
import { SmtpForm } from "@/components/settings/smtp-form";

export default async function IntegrationsPage() {
  const session = await requireAdminPage();
  const [integration, operator, platform] = await Promise.all([
    getSchoolIntegration(session.schoolId),
    isPlatformOperator(session.adminId),
    getPlatformSettings(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Messaging</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Connect this school to the platforms that message parents on its behalf.
        </p>
      </div>
      <IqPigeonIntegration integration={integration} />
      <ExtraIntegrations />
      {operator ? <SmtpForm settings={toGatewayPublicView(platform).smtp} /> : null}
    </div>
  );
}
