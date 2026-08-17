import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/guards";
import { getPlatformSettings, isPlatformOperator, toGatewayPublicView } from "@/lib/services/platform";
import { PaymentsForm } from "@/components/settings/payments-form";

export default async function PaymentsPage() {
  const session = await requireAdminPage();
  if (!(await isPlatformOperator(session.adminId))) {
    redirect("/settings/billing");
  }
  const settings = toGatewayPublicView(await getPlatformSettings());
  return <PaymentsForm settings={settings} />;
}
