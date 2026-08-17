import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import {
  dayOfMonth,
  formatClock24,
  formatDayMonth,
  formatRelative,
  schoolNowParts,
  startOfSchoolDay,
  weekdayNarrow,
  weekdayShort,
} from "@/lib/dates";
import { fullName, initials } from "@/lib/names";
import { AttendanceChart, type ChartPoint } from "@/components/dashboard/attendance-chart";
import { BreakdownDonut } from "@/components/dashboard/breakdown-donut";
import { GateLog, type GateRow } from "@/components/dashboard/gate-log";
import { HeroMetric } from "@/components/dashboard/hero-metric";
import {
  NotificationFeed,
  type NotificationItem,
} from "@/components/dashboard/notification-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TerminalStatus, type TerminalRow } from "@/components/dashboard/terminal-status";
import {
  TodayAgenda,
  type AgendaEntry,
  type WeekCell,
} from "@/components/dashboard/today-agenda";

const DAY_MS = 24 * 60 * 60 * 1000;

function hourLabel(hour: number) {
  const base = hour % 12 === 0 ? 12 : hour % 12;
  return `${base}${hour < 12 ? "a" : "p"}`;
}

function delta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? null : { pct: 100, up: true };
  const change = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(change), up: change >= 0 };
}

export default async function DashboardPage() {
  const session = await requireAdminPage();
  const school = await prisma.school.findUniqueOrThrow({ where: { id: session.schoolId } });
  const timezone = school.timezone;

  // Seven school-day buckets, keyed by the school's own calendar date so the
  // grouping stays correct regardless of the server's timezone.
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() - (6 - index) * DAY_MS);
    return { date, key: schoolNowParts(timezone, date).dateKey };
  });
  const weekStart = startOfSchoolDay(timezone, days[0].date);
  const todayKey = days[6].key;
  const yesterdayKey = days[5].key;

  const [students, parents, enrolled, weekEvents, recent, notifications, terminals] =
    await Promise.all([
      prisma.student.count({ where: { schoolId: school.id, status: "ACTIVE" } }),
      prisma.parent.count({ where: { schoolId: school.id } }),
      prisma.student.count({
        where: { schoolId: school.id, status: "ACTIVE", fingerprints: { some: {} } },
      }),
      prisma.attendanceEvent.findMany({
        where: { student: { schoolId: school.id }, timestamp: { gte: weekStart } },
        select: { eventType: true, timestamp: true, studentId: true },
        orderBy: { timestamp: "asc" },
      }),
      prisma.attendanceEvent.findMany({
        where: { student: { schoolId: school.id } },
        include: { student: true, terminal: true },
        orderBy: { timestamp: "desc" },
        take: 10,
      }),
      prisma.notificationLog.findMany({
        where: { student: { schoolId: school.id } },
        include: { student: true, attendanceEvent: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.terminal.findMany({ where: { schoolId: school.id }, orderBy: { name: "asc" } }),
    ]);

  const dailyArrivals = new Array(7).fill(0);
  const dailyDepartures = new Array(7).fill(0);
  const hourlyArrivals = new Array(24).fill(0);
  const hourlyDepartures = new Array(24).fill(0);
  const arrivedToday = new Set<string>();
  const latestToday = new Map<string, "ARRIVAL" | "DEPARTURE">();
  const dayIndex = new Map(days.map((day, index) => [day.key, index]));

  for (const event of weekEvents) {
    const parts = schoolNowParts(timezone, event.timestamp);
    const index = dayIndex.get(parts.dateKey);
    if (index !== undefined) {
      if (event.eventType === "ARRIVAL") dailyArrivals[index] += 1;
      else dailyDepartures[index] += 1;
    }
    if (parts.dateKey === todayKey) {
      if (event.eventType === "ARRIVAL") {
        hourlyArrivals[parts.hours] += 1;
        arrivedToday.add(event.studentId);
      } else {
        hourlyDepartures[parts.hours] += 1;
      }
      // weekEvents is ascending, so the final write per student is their latest.
      latestToday.set(event.studentId, event.eventType);
    }
  }

  const arrivals = dailyArrivals[6];
  const departures = dailyDepartures[6];
  const previousIndex = dayIndex.get(yesterdayKey) ?? 5;
  const states = [...latestToday.values()];
  const onSite = states.filter((state) => state === "ARRIVAL").length;
  const departed = states.filter((state) => state === "DEPARTURE").length;
  const awaiting = Math.max(0, students - arrivedToday.size);
  const coverage = students > 0 ? Math.round((enrolled / students) * 100) : 0;

  const todaySeries: ChartPoint[] = hourlyArrivals.map((count, hour) => ({
    label: hourLabel(hour),
    arrivals: count,
    departures: hourlyDepartures[hour],
  }));
  const weekSeries: ChartPoint[] = days.map((day, index) => ({
    label: weekdayShort(day.date, timezone),
    arrivals: dailyArrivals[index],
    departures: dailyDepartures[index],
  }));

  const week: WeekCell[] = days.map((day, index) => ({
    key: day.key,
    narrow: weekdayNarrow(day.date, timezone),
    day: dayOfMonth(day.date, timezone),
    count: dailyArrivals[index] + dailyDepartures[index],
    isToday: day.key === todayKey,
  }));

  const todayEvents = recent.filter(
    (event) => schoolNowParts(timezone, event.timestamp).dateKey === todayKey,
  );
  const agenda: AgendaEntry[] = todayEvents.slice(0, 5).map((event) => ({
    id: event.id,
    time: formatClock24(event.timestamp, timezone),
    name: fullName(event.student),
    arrival: event.eventType === "ARRIVAL",
  }));

  const gateRows: GateRow[] = recent.map((event) => ({
    id: event.id,
    name: fullName(event.student),
    initials: initials(fullName(event.student)),
    terminal: event.terminal.name,
    time: formatClock24(event.timestamp, timezone),
    relative: formatRelative(event.timestamp, now),
    arrival: event.eventType === "ARRIVAL",
  }));

  const alerts: NotificationItem[] = notifications.map((entry) => ({
    id: entry.id,
    title: `${fullName(entry.student)} ${
      entry.attendanceEvent.eventType === "ARRIVAL" ? "arrived" : "departed"
    }`,
    subtitle: entry.recipient,
    relative: formatRelative(entry.createdAt, now),
    status: entry.status,
    arrival: entry.attendanceEvent.eventType === "ARRIVAL",
  }));

  const terminalRows: TerminalRow[] = terminals.map((terminal) => ({
    id: terminal.id,
    name: terminal.name,
    location: terminal.location,
    active: terminal.status === "ACTIVE",
    lastSeen: terminal.lastActivityAt
      ? `Last scan ${formatRelative(terminal.lastActivityAt, now)}`
      : "No scans yet",
  }));

  const hour = schoolNowParts(timezone, now).hours;
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            {greeting}
          </p>
          <h1 className="truncate text-[19px] font-bold tracking-tight sm:text-[24px]">
            {session.name.split(" ")[0]}
          </h1>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-ring" />
          {formatDayMonth(now, timezone)}
        </span>
      </div>

      <HeroMetric
        onSite={onSite}
        totalStudents={students}
        arrivals={arrivals}
        departures={departures}
        awaiting={awaiting}
      />

      <QuickActions />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatTile
          tone="violet"
          href="/students"
          label="Students"
          caption={`${coverage}% biometric ready`}
          value={students}
          spark={dailyArrivals}
        />
        <StatTile
          tone="rose"
          href="/attendance"
          label="Arrivals"
          caption="Today"
          value={arrivals}
          delta={delta(arrivals, dailyArrivals[previousIndex])}
          spark={dailyArrivals}
        />
        <StatTile
          tone="sky"
          href="/attendance"
          label="Departures"
          caption="Today"
          value={departures}
          delta={delta(departures, dailyDepartures[previousIndex])}
          spark={dailyDepartures}
        />
        <StatTile
          tone="amber"
          href="/parents"
          label="Parents"
          caption="Linked contacts"
          value={parents}
          spark={dailyDepartures}
        />
      </div>

      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <AttendanceChart today={todaySeries} week={weekSeries} />
        </div>
        <div className="min-w-0">
          <BreakdownDonut onSite={onSite} departed={departed} awaiting={awaiting} />
        </div>
      </div>

      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        <div className="min-w-0">
          <TodayAgenda
            dayLabel={formatDayMonth(now, timezone)}
            weekday={weekdayShort(now, timezone)}
            entries={agenda}
            week={week}
            moreCount={Math.max(0, todayEvents.length - agenda.length)}
          />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <GateLog rows={gateRows} />
        </div>
      </div>

      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <NotificationFeed items={alerts} />
        </div>
        <div className="min-w-0">
          <TerminalStatus terminals={terminalRows} />
        </div>
      </div>
    </div>
  );
}
