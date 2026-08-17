import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { formatTime } from "@/lib/dates";
import { todayRange } from "@/lib/services/school-day";
import { fullName } from "@/lib/names";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";

export default async function DashboardPage() {
  const session = await requireAdminPage();
  const school = await prisma.school.findUniqueOrThrow({ where: { id: session.schoolId } });
  const { start, end } = todayRange(school.timezone);

  const [students, parents, arrivals, departures, recent, notifications, terminals] = await Promise.all([
    prisma.student.count({ where: { schoolId: school.id, status: "ACTIVE" } }),
    prisma.parent.count({ where: { schoolId: school.id } }),
    prisma.attendanceEvent.count({
      where: {
        eventType: "ARRIVAL",
        timestamp: { gte: start, lt: end },
        student: { schoolId: school.id },
      },
    }),
    prisma.attendanceEvent.count({
      where: {
        eventType: "DEPARTURE",
        timestamp: { gte: start, lt: end },
        student: { schoolId: school.id },
      },
    }),
    prisma.attendanceEvent.findMany({
      where: { student: { schoolId: school.id } },
      include: { student: true, terminal: true },
      orderBy: { timestamp: "desc" },
      take: 8,
    }),
    prisma.notificationLog.findMany({
      where: { student: { schoolId: school.id } },
      include: { student: true, attendanceEvent: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.terminal.findMany({
      where: { schoolId: school.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const cards = [
    { label: "Students", value: students, href: "/students" },
    { label: "Parents", value: parents, href: "/parents" },
    { label: "Today's arrivals", value: arrivals, href: "/attendance" },
    { label: "Today's departures", value: departures, href: "/attendance" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={`${greeting}, ${session.name.split(" ")[0]}`}
        description={`Here's what's happening at ${school.name} today.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <p className="text-sm text-ink-muted">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Recent activity</h2>
            <Link href="/attendance" className="text-sm font-medium text-brand">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              title="No attendance events today"
              body="Activity will appear here when students check in at a terminal."
            />
          ) : (
            <ol className="mt-5 space-y-4">
              {recent.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{fullName(event.student)}</p>
                    <p className="text-sm text-ink-muted">{event.terminal.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={event.eventType === "ARRIVAL" ? "ok" : "brand"}>
                      {event.eventType === "ARRIVAL" ? "ARRIVED" : "DEPARTED"}
                    </Badge>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatTime(event.timestamp, school.timezone)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-semibold">Terminals</h2>
            <div className="mt-4 space-y-3">
              {terminals.map((terminal) => (
                <div key={terminal.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{terminal.name}</span>
                  <Badge tone={terminal.status === "ACTIVE" ? "ok" : "warn"}>{terminal.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold">Notifications</h2>
            <p className="mt-1 text-xs text-ink-muted">Mock WhatsApp provider. No live API.</p>
            {notifications.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">No notifications generated yet.</p>
            ) : (
              <p className="mt-4 text-3xl font-semibold">{notifications.length}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
