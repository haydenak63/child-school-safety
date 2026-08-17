import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { getSchoolIntegration, saveSchoolIntegration } from "@/lib/services/integrations";
import { integrationSettingsSchema, parseBody } from "@/lib/validation";

export async function GET() {
  try {
    // The school always comes from the session, never from the request.
    const session = await requireSession();
    return Response.json({ integration: await getSchoolIntegration(session.schoolId) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const body = parseBody(integrationSettingsSchema, await readJson(request));
    const integration = await saveSchoolIntegration({
      schoolId: session.schoolId,
      enabled: body.enabled,
      baseUrl: body.baseUrl,
      apiKey: body.apiKey,
      secret: body.secret,
    });
    return Response.json({ integration });
  } catch (error) {
    return errorResponse(error);
  }
}
