"use client";

import { useMemo, useState } from "react";
import { Badge, Card, EmptyState, fieldClass } from "@/components/ui/primitives";

type ParentRow = {
  id: string;
  name: string;
  relationship: string;
  whatsappNumber: string;
  students: string[];
};

export function ParentDirectory({ parents }: { parents: ParentRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return parents;
    return parents.filter((parent) =>
      [parent.name, parent.relationship, parent.whatsappNumber, ...parent.students]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [query, parents]);

  return (
    <div className="mt-6">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search parents"
        className={`${fieldClass} max-w-md`}
        aria-label="Search parents"
      />
      {filtered.length === 0 ? (
        <Card className="mt-6">
          <EmptyState title="No parents yet" body="Parents appear here when you create students." />
        </Card>
      ) : (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {filtered.map((parent) => (
              <Card key={parent.id} className="p-4">
                <p className="font-semibold">{parent.name}</p>
                <p className="mt-1 text-sm text-ink-muted">{parent.relationship}</p>
                <p className="mt-2 text-sm">{parent.whatsappNumber}</p>
                <p className="mt-3 text-sm text-ink-muted">{parent.students.join(", ") || "No students"}</p>
                <div className="mt-3">
                  <Badge tone="brand">Notifications logged</Badge>
                </div>
              </Card>
            ))}
          </div>
          <Card className="mt-4 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Relationship</th>
                  <th className="px-5 py-3 font-medium">WhatsApp</th>
                  <th className="px-5 py-3 font-medium">Students</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((parent) => (
                  <tr key={parent.id} className="border-t border-line">
                    <td className="px-5 py-4 font-medium">{parent.name}</td>
                    <td className="px-5 py-4">{parent.relationship}</td>
                    <td className="px-5 py-4">{parent.whatsappNumber}</td>
                    <td className="px-5 py-4">{parent.students.join(", ") || "—"}</td>
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
