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

export function originFromRequest(request: Request): string {
  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) return headerOrigin.replace(/\/$/, "");

  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https://") ? "https" : "http");
  if (host) return `${proto}://${host}`;
  return getAppUrl();
}

export function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>([getAppUrl(), originFromRequest(request)]);
  try {
    origins.add(new URL(request.url).origin);
  } catch {
    // ignore invalid request URL
  }
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https://") ? "https" : "http");
  if (host) origins.add(`${proto}://${host}`);
  return origins;
}

export function getBiometricProviderName(): "camera" | "hardware" {
  return process.env.BIOMETRIC_PROVIDER === "hardware" ? "hardware" : "camera";
}
