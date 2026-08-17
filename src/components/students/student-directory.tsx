"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState, fieldClass } from "@/components/ui/primitives";

type StudentRow = {
  id: string;
  name: string;
  studentNumber: string;
  className: string;
  section: string;
  status: string;
  enrolled: boolean;
  parent: string;
};

export function StudentDirectory({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return students;
    return students.filter((student) =>
      [student.name, student.studentNumber, student.className, student.section, student.parent]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [query, students]);

  return (
    <div className="mt-6">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search students"
        className={`${fieldClass} max-w-md`}
        aria-label="Search students"
      />

      {filtered.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            title={students.length === 0 ? "No students yet" : "No matching students"}
            body={
              students.length === 0
                ? "Start by adding your first student to begin managing attendance."
                : "Try a different name, class, or student number."
            }
            action={
              students.length === 0 ? (
                <Link href="/students/new" className="text-sm font-semibold text-brand">
                  Add student
                </Link>
              ) : null
            }
          />
        </Card>
      ) : (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {filtered.map((student) => (
              <Link key={student.id} href={`/students/${student.id}`}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {student.className} · Section {student.section}
                      </p>
                    </div>
                    <Badge tone={student.enrolled ? "ok" : "warn"}>
                      {student.enrolled ? "Enrolled" : "Not enrolled"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">Parent · {student.parent}</p>
                  <p className="mt-1 text-xs text-ink-muted">{student.status}</p>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="mt-4 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Parent</th>
                  <th className="px-5 py-3 font-medium">Fingerprint</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id} className="border-t border-line">
                    <td className="px-5 py-4">
                      <Link href={`/students/${student.id}`} className="font-medium">
                        {student.name}
                      </Link>
                      <p className="text-xs text-ink-muted">{student.studentNumber}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">
                      {student.className} — Section {student.section}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{student.parent}</td>
                    <td className="px-5 py-4">
                      <Badge tone={student.enrolled ? "ok" : "warn"}>
                        {student.enrolled ? "✓ Enrolled" : "Not enrolled"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
