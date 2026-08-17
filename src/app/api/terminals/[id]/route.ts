import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, readJson } from "@/lib/http";
import { createSecureToken, encryptString, hashToken } from "@/lib/crypto";
import { cameraPageOrigin } from "@/lib/env";
import { terminalPublicView } from "@/lib/services/terminals";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = z
      .object({
        name: z.string().trim().min(1).max(80).optional(),
        location: z.string().trim().min(1).max(120).optional(),
        status: z.enum(["ACTIVE", "REVOKED"]).optional(),
        rotateToken: z.boolean().optional(),
      })
      .parse(await readJson(request));

    const terminal = await prisma.terminal.findFirst({
      where: { id, schoolId: session.schoolId },
    });
    if (!terminal) throw new AppError("NOT_FOUND", "Terminal not found.", 404);

    const data: {
      name?: string;
      location?: string;
      status?: "ACTIVE" | "REVOKED";
      tokenHash?: string;
      tokenEncrypted?: string;
    } = {
      name: body.name,
      location: body.location,
      status: body.status,
    };

    if (body.rotateToken) {
      const token = createSecureToken();
      data.tokenHash = hashToken(token);
      data.tokenEncrypted = encryptString(token);
    }

    const updated = await prisma.terminal.update({ where: { id }, data });
    return Response.json({
      terminal: await terminalPublicView(updated, cameraPageOrigin(request)),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
