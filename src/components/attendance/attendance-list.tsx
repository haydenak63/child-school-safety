import { Badge, Card, EmptyState } from "@/components/ui/primitives";

type EventRow = {
  id: string;
  time: string;
  student: string;
  eventType: string;
  terminal: string;
  confidence: number;
};

export function AttendanceList({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <Card className="mt-6">
        <EmptyState
          title="No attendance events"
          body="Attendance activity will appear here when students check in."
        />
      </Card>
    );
  }

  return (
    <>
      <div className="mt-6 space-y-3 md:hidden">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{event.student}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {event.eventType} · {event.time}
                </p>
              </div>
              <Badge tone={event.eventType === "ARRIVAL" ? "ok" : "brand"}>{event.eventType}</Badge>
            </div>
            <p className="mt-3 text-sm text-ink-muted">{event.terminal}</p>
            <p className="mt-1 text-sm">Confidence {event.confidence}%</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-ink-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Terminal</th>
              <th className="px-5 py-3 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-line">
                <td className="px-5 py-4">{event.time}</td>
                <td className="px-5 py-4 font-medium">{event.student}</td>
                <td className="px-5 py-4">
                  <Badge tone={event.eventType === "ARRIVAL" ? "ok" : "brand"}>
                    {event.eventType === "ARRIVAL" ? "↑ ARRIVAL" : "↓ DEPARTURE"}
                  </Badge>
                </td>
                <td className="px-5 py-4">{event.terminal}</td>
                <td className="px-5 py-4">{event.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
