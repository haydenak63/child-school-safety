import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { listDiagnostics } from "@/lib/biometric/diagnostics";
import { isDemoMode } from "@/lib/env";

export async function GET() {
  try {
    await requireSession();
    if (!isDemoMode()) {
      return Response.json({ events: [], demoMode: false });
    }
    return Response.json({ events: listDiagnostics(), demoMode: true });
  } catch (error) {
    return errorResponse(error);
  }
}
