function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAuthSecret(): string {
  const secret = required("AUTH_SECRET");
  if (secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters.");
  }
  return secret;
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function firstHeaderValue(value: string | null | undefined): string {
  return value?.split(",")[0]?.trim() ?? "";
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function originFromRequest(request: Request): string {
  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) return headerOrigin.replace(/\/$/, "");

  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    request.headers.get("host") ||
    "";
  const proto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ||
    (request.url.startsWith("https://") ? "https" : "http");
  if (host) return `${proto}://${host}`;
  return getAppUrl();
}

/** QR and camera pages must be HTTPS on phones or Chrome never shows a permission prompt. */
export function cameraPageOrigin(request: Request): string {
  const candidates = [getAppUrl(), originFromRequest(request)];
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:") return url.origin;
    } catch {
      // ignore invalid candidate
    }
  }
  try {
    const url = new URL(originFromRequest(request));
    if (!isLocalHostname(url.hostname)) {
      url.protocol = "https:";
      return url.origin;
    }
  } catch {
    // ignore invalid origin
  }
  return originFromRequest(request);
}

export function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>([getAppUrl(), originFromRequest(request)]);
  try {
    origins.add(new URL(request.url).origin);
  } catch {
    // ignore invalid request URL
  }
  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    request.headers.get("host");
  const proto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ||
    (request.url.startsWith("https://") ? "https" : "http");
  if (host) origins.add(`${proto}://${host}`);
  return origins;
}

export function getBiometricProviderName(): "camera" | "hardware" {
  return process.env.BIOMETRIC_PROVIDER === "hardware" ? "hardware" : "camera";
}
