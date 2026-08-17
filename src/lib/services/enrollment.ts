import { AppError } from "@/lib/errors";

export function evaluateEnrollmentSession(
  session: { expiresAt: Date; usedAt: Date | null },
  now = new Date(),
): "ok" | "expired" | "used" {
  if (session.usedAt) return "used";
  if (session.expiresAt.getTime() <= now.getTime()) return "expired";
  return "ok";
}

export function assertEnrollmentUsable(
  session: { expiresAt: Date; usedAt: Date | null },
  now = new Date(),
): void {
  const state = evaluateEnrollmentSession(session, now);
  if (state === "used") {
    throw new AppError("ENROLLMENT_USED", "This enrollment link has already been used.", 409);
  }
  if (state === "expired") {
    throw new AppError("ENROLLMENT_EXPIRED", "This enrollment link has expired.", 410);
  }
}

export const ENROLLMENT_TTL_MS = 5 * 60 * 1000;
