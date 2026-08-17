import { NextRequest, NextResponse } from "next/server";
import { originFromRequest } from "@/lib/env";
import { publicErrorMessage } from "@/lib/errors";
import { readJson } from "@/lib/http";

export async function readAuthPayload(request: NextRequest): Promise<{
  data: Record<string, unknown>;
  isForm: boolean;
}> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await readJson<Record<string, unknown>>(request);
    return { data, isForm: false };
  }

  const form = await request.formData();
  const data: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") data[key] = value;
  }
  return { data, isForm: true };
}

export function authRedirect(request: NextRequest, path: string) {
  return NextResponse.redirect(`${originFromRequest(request)}${path}`, 303);
}

export function withQuery(path: string, params: Record<string, string | undefined>) {
  const url = new URL(path, "http://local.invalid");
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}`;
}

export function authFormRedirect(
  request: NextRequest,
  path: string,
  error: unknown,
  extra: Record<string, string | undefined> = {},
) {
  return authRedirect(
    request,
    withQuery(path, { ...extra, error: publicErrorMessage(error) }),
  );
}
