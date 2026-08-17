import { NextRequest } from "next/server";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { captureSchema, parseBody } from "@/lib/validation";
import { requireTerminal } from "@/lib/services/terminals";
import { identifyFingerprint } from "@/lib/services/biometric";
import { z } from "zod";

const schema = captureSchema.extend({
  terminalToken: z.string().min(16),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const limited = rateLimit(clientKey(request, "biometric-identify"), 30, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many scan attempts. Please wait and try again.", 429);
    }

    const body = parseBody(schema, await readJson(request));
    const terminal = await requireTerminal(body.terminalToken);
    const result = await identifyFingerprint({
      schoolId: terminal.schoolId,
      image: body.image,
      threshold: terminal.school.matchThreshold,
    });

    return Response.json({
      matched: true,
      student: result.student,
      confidence: result.confidence,
      quality: result.quality,
      diagnostics: result.diagnostics,
      terminal: { name: terminal.name, location: terminal.location },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
