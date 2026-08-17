export const VERIFY_EMAIL_TTL_MS = 48 * 60 * 60 * 1000;
export const RESET_PASSWORD_TTL_MS = 60 * 60 * 1000;

export function evaluateAuthToken(
  token: { expiresAt: Date; usedAt: Date | null },
  now = new Date(),
): "ok" | "expired" | "used" {
  if (token.usedAt) return "used";
  if (token.expiresAt.getTime() <= now.getTime()) return "expired";
  return "ok";
}
