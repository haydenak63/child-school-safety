import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthSecret } from "@/lib/env";

export type AdminSession = {
  adminId: string;
  schoolId: string;
  email: string;
  name: string;
};

function cookieSecure(): boolean {
  return process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") === true;
}

export function sessionOptions(): SessionOptions {
  return {
    cookieName: "csp_admin",
    password: getAuthSecret(),
    cookieOptions: {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getSession(): Promise<IronSession<Partial<AdminSession>>> {
  return getIronSession<Partial<AdminSession>>(await cookies(), sessionOptions());
}

export async function getSessionFromResponse(
  request: NextRequest,
  response: NextResponse,
): Promise<IronSession<Partial<AdminSession>>> {
  return getIronSession<Partial<AdminSession>>(request, response, sessionOptions());
}

export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session.adminId || !session.schoolId || !session.email || !session.name) {
    const { AppError } = await import("@/lib/errors");
    throw new AppError("UNAUTHORIZED", "Please sign in to continue.", 401);
  }
  return {
    adminId: session.adminId,
    schoolId: session.schoolId,
    email: session.email,
    name: session.name,
  };
}
