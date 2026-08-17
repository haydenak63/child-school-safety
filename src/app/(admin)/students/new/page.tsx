"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/client/api";
import { Button, Card, Field, PageHeader, fieldClass } from "@/components/ui/primitives";

export default function NewStudentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const created = await api<{ student: { id: string } }>("/api/students", {
        method: "POST",
        body: JSON.stringify({
          studentNumber: form.get("studentNumber"),
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          className: form.get("className"),
          section: form.get("section"),
          parent: {
            name: form.get("parentName"),
            relationship: form.get("relationship"),
            whatsappNumber: form.get("whatsappNumber"),
            isPrimary: true,
          },
        }),
      });
      router.push(`/students/${created.student.id}?created=1`);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Unable to create student."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add student" description="Create a student and associate a parent or guardian." />
      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Student information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input name="firstName" required className={fieldClass} />
            </Field>
            <Field label="Last name">
              <input name="lastName" required className={fieldClass} />
            </Field>
            <Field label="Student number">
              <input name="studentNumber" required className={fieldClass} />
            </Field>
            <Field label="Class / grade">
              <input name="className" defaultValue="Grade 5" required className={fieldClass} />
            </Field>
            <Field label="Section">
              <input name="section" defaultValue="B" required className={fieldClass} />
            </Field>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-base font-semibold">Parent information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Parent name">
              <input name="parentName" required className={fieldClass} />
            </Field>
            <Field label="Relationship">
              <select name="relationship" className={fieldClass} defaultValue="Father">
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="WhatsApp number">
                <input name="whatsappNumber" placeholder="+923001112223" required className={fieldClass} />
              </Field>
            </div>
          </div>
        </Card>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" href="/students">
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Create student"}
          </Button>
        </div>
      </form>
    </div>
  );
}
