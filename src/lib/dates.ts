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

export function formatTimeShort(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
