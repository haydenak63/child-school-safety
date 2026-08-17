import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export async function requireAdminPage() {
  const session = await getSession();
  if (!session.adminId || !session.schoolId) {
    redirect("/login");
  }
  return {
    adminId: session.adminId,
    schoolId: session.schoolId,
    email: session.email ?? "",
    name: session.name ?? "Admin",
  };
}
