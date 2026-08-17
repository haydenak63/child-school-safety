import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { getSchoolIntegration, testSchoolIntegration } from "@/lib/services/integrations";
import { integrationTestSchema, parseBody } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const body = parseBody(integrationTestSchema, await readJson(request));
    const result = await testSchoolIntegration({
      schoolId: session.schoolId,
      testRecipient: body.testRecipient || undefined,
    });
    // A rejected test is a diagnostic, not a failed request: return 200 so the
    // UI can render the outcome instead of a generic error.
    return Response.json({
      result,
      integration: await getSchoolIntegration(session.schoolId),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
