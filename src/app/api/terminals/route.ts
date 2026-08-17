import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { parseBody, terminalSchema } from "@/lib/validation";
import { cameraPageOrigin } from "@/lib/env";
import { createTerminalRecord, terminalPublicView } from "@/lib/services/terminals";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const origin = cameraPageOrigin(request);
    const terminals = await prisma.terminal.findMany({
      where: { schoolId: session.schoolId },
      orderBy: { createdAt: "asc" },
    });
    return Response.json({
      terminals: await Promise.all(
        terminals.map((terminal) => terminalPublicView(terminal, origin)),
      ),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const origin = cameraPageOrigin(request);
    const body = parseBody(terminalSchema, await readJson(request));
    const created = await createTerminalRecord({
      schoolId: session.schoolId,
      name: body.name,
      location: body.location,
    });
    return Response.json(
      {
        terminal: await terminalPublicView(created.terminal, origin),
        url: `${origin}/terminal/${created.token}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
