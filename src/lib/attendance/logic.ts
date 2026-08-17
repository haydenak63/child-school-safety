export type AttendanceEventType = "ARRIVAL" | "DEPARTURE";

export function resolveEventType(lastTodayType: AttendanceEventType | null): AttendanceEventType {
  if (!lastTodayType || lastTodayType === "DEPARTURE") return "ARRIVAL";
  return "DEPARTURE";
}

export function isWithinCooldown(
  lastTimestamp: Date | null | undefined,
  now: Date,
  cooldownSeconds: number,
): boolean {
  if (!lastTimestamp) return false;
  return now.getTime() - lastTimestamp.getTime() < cooldownSeconds * 1000;
}

export function remainingCooldownSeconds(
  lastTimestamp: Date,
  now: Date,
  cooldownSeconds: number,
): number {
  const remaining = cooldownSeconds - (now.getTime() - lastTimestamp.getTime()) / 1000;
  return Math.max(0, Math.ceil(remaining));
}
