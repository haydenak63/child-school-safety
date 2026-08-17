"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/client/api";
import { Button, Card, fieldClass } from "@/components/ui/primitives";

type StudentDetail = {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  section: string;
  studentNumber: string;
  status: string;
  fingerprintEnrolled: boolean;
  parents: Array<{
    isPrimary: boolean;
    parent: { id: string; name: string; relationship: string; whatsappNumber: string };
  }>;
};

export function StudentDetailActions({ student }: { student: StudentDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function addParent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api(`/api/students/${student.id}/parents`, {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          relationship: form.get("relationship"),
          whatsappNumber: form.get("whatsappNumber"),
        }),
      });
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to add parent."));
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    setBusy(true);
    try {
      await api(`/api/students/${student.id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to update student."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button href={`/students/${student.id}/enroll`}>Enroll fingerprint</Button>
        {student.status === "ACTIVE" ? (
          <Button onClick={deactivate} disabled={busy} variant="secondary">
            Deactivate student
          </Button>
        ) : null}
      </div>
      <Card className="p-5">
        <h3 className="font-semibold">Add another parent</h3>
        <form onSubmit={addParent} className="mt-3 grid gap-3 sm:grid-cols-3">
          <input name="name" placeholder="Name" required className={fieldClass} />
          <input name="relationship" placeholder="Mother" required className={fieldClass} />
          <input name="whatsappNumber" placeholder="+92..." required className={fieldClass} />
          <Button type="submit" disabled={busy} className="sm:col-span-3 sm:w-fit">
            Associate parent
          </Button>
        </form>
      </Card>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
