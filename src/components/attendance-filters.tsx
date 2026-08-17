"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { fieldClass } from "@/components/ui/primitives";

export function AttendanceFilters({
  students,
  terminals,
}: {
  students: Array<{ id: string; firstName: string; lastName: string }>;
  terminals: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    router.push(`/attendance?${next.toString()}`);
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input
        type="date"
        defaultValue={params.get("date") ?? ""}
        onChange={(event) => update("date", event.target.value)}
        className={fieldClass}
        aria-label="Date"
      />
      <select
        defaultValue={params.get("studentId") ?? ""}
        onChange={(event) => update("studentId", event.target.value)}
        className={fieldClass}
        aria-label="Student"
      >
        <option value="">All students</option>
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.firstName} {student.lastName}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("terminalId") ?? ""}
        onChange={(event) => update("terminalId", event.target.value)}
        className={fieldClass}
        aria-label="Terminal"
      >
        <option value="">All terminals</option>
        {terminals.map((terminal) => (
          <option key={terminal.id} value={terminal.id}>
            {terminal.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("eventType") ?? ""}
        onChange={(event) => update("eventType", event.target.value)}
        className={fieldClass}
        aria-label="Event type"
      >
        <option value="">Arrival and departure</option>
        <option value="ARRIVAL">ARRIVAL</option>
        <option value="DEPARTURE">DEPARTURE</option>
      </select>
    </div>
  );
}
