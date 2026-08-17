import { AppError } from "@/lib/errors";
import { allowedOrigins } from "@/lib/env";

const MAX_JSON_BYTES = 2_500_000;

export function assertSameOrigin(request: Request): void {
  const originHeader = request.headers.get("origin");
  const referer = request.headers.get("referer");
  let origin = originHeader;
  if (!origin && referer) {
    try {
      origin = new URL(referer).origin;
    } catch {
      origin = null;
    }
  }
  if (!origin) return;

  const allowed = allowedOrigins(request);
  const originHost = new URL(origin).hostname;
  const allowedHosts = [...allowed].flatMap((value) => {
    try {
      return [new URL(value).hostname];
    } catch {
      return [];
    }
  });

  if (allowedHosts.includes(originHost)) return;
  if ([...allowed].some((value) => {
    try {
      return new URL(value).origin === origin;
    } catch {
      return false;
    }
  })) {
    return;
  }

  throw new AppError("FORBIDDEN", "Invalid request origin.", 403);
}

export async function readJson<T>(request: Request): Promise<T> {
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > MAX_JSON_BYTES) {
    throw new AppError("VALIDATION", "Request body is too large.", 413);
  }

  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_JSON_BYTES) {
    throw new AppError("VALIDATION", "Request body is too large.", 413);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AppError("VALIDATION", "Invalid JSON body.");
  }
}
