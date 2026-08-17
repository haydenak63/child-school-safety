import { NextRequest, NextResponse } from "next/server";
import { getSessionFromResponse } from "@/lib/auth/session";
import { originFromRequest } from "@/lib/env";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");
  const response = isForm
    ? NextResponse.redirect(`${originFromRequest(request)}/login`, 303)
    : NextResponse.json({ ok: true });
  const session = await getSessionFromResponse(request, response);
  session.destroy();
  return response;
}
