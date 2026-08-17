import { startOfSchoolDay } from "@/lib/dates";

export function todayRange(timeZone: string, now = new Date()) {
  const start = startOfSchoolDay(timeZone, now);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
