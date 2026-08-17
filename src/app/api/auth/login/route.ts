import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromResponse } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { AppError, errorResponse } from "@/lib/errors";
import { originFromRequest } from "@/lib/env";
import { clientKey, rateLimit } from "@/lib/rate-limit";

function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }
  return value;
}

async function readCredentials(request: NextRequest): Promise<{
  email: string;
  password: string;
  next: string;
  isForm: boolean;
}> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: string; password?: string; next?: string };
    return {
      email: String(body.email ?? "").trim(),
      password: String(body.password ?? ""),
      next: safeNextPath(body.next),
      isForm: false,
    };
  }

  const form = await request.formData();
  return {
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
    next: safeNextPath(String(form.get("next") ?? "")),
    isForm: true,
  };
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(`${originFromRequest(request)}${path}`, 303);
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "login"), 8, 60_000);
    if (!limited.ok) {
      throw new AppError("RATE_LIMITED", "Too many login attempts. Please wait and try again.", 429);
    }

    const credentials = await readCredentials(request);
    if (!credentials.email || !credentials.password) {
      if (credentials.isForm) {
        return redirectTo(
          request,
          `/login?error=${encodeURIComponent("Enter email and password.")}&next=${encodeURIComponent(credentials.next)}`,
        );
      }
      throw new AppError("VALIDATION", "Enter email and password.");
    }

    const admin = await prisma.admin.findUnique({
      where: { email: credentials.email.toLowerCase() },
    });
    if (!admin || !(await verifyPassword(credentials.password, admin.passwordHash))) {
      if (credentials.isForm) {
        return redirectTo(
          request,
          `/login?error=${encodeURIComponent("Invalid email or password.")}&next=${encodeURIComponent(credentials.next)}`,
        );
      }
      throw new AppError("UNAUTHORIZED", "Invalid email or password.", 401);
    }

    const response = credentials.isForm
      ? redirectTo(request, credentials.next)
      : NextResponse.json({ ok: true });
    const session = await getSessionFromResponse(request, response);
    session.adminId = admin.id;
    session.schoolId = admin.schoolId;
    session.email = admin.email;
    session.name = admin.name;
    await session.save();
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
