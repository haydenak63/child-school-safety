export function schoolNowParts(timeZone: string, date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hours: Number(parts.hour),
    minutes: Number(parts.minute),
    seconds: Number(parts.second),
  };
}

export function startOfSchoolDay(timeZone: string, date = new Date()): Date {
  const { dateKey } = schoolNowParts(timeZone, date);
  const utcMidnight = new Date(`${dateKey}T00:00:00.000Z`);
  const shown = schoolNowParts(timeZone, utcMidnight);
  const offsetMs = ((shown.hours * 60 + shown.minutes) * 60 + shown.seconds) * 1000;
  return new Date(utcMidnight.getTime() - offsetMs);
}

export function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

// Feeds parent notification time labels, including IQ Pigeon's `local_time`.
// The hour is zero-padded to match the agreed wire format ("08:42 AM").
export function formatTimeShort(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatClock24(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatDayMonth(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "short",
  }).format(date);
}

export function weekdayShort(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
}

export function weekdayNarrow(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "narrow" }).format(date);
}

export function dayOfMonth(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric" }).format(date);
}

export function formatRelative(date: Date, now = new Date()): string {
  const minutes = Math.floor(Math.max(0, now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 7)} wk ago`;
}
