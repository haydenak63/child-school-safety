import { requireAdminPage } from "@/lib/auth/guards";
import { listDiagnostics } from "@/lib/biometric/diagnostics";
import { isDemoMode } from "@/lib/env";
import { redirect } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/primitives";

export default async function DiagnosticsPage() {
  await requireAdminPage();
  if (!isDemoMode()) redirect("/settings");
  const events = listDiagnostics();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Demo mode"
        title="Biometric diagnostics"
        description="Development-only view of image size, quality, confidence, and match outcome. Templates are never displayed."
      />
      <div className="mt-6 space-y-3">
        {events.length === 0 ? (
          <Card className="p-6 text-sm text-ink-muted">
            No biometric events yet. Enroll or scan a fingerprint to populate this log.
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="p-5 text-sm">
              <p className="font-semibold uppercase tracking-wide text-ink-muted">{event.action}</p>
              <p className="mt-1 text-ink-muted">{event.at}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div>
                  <dt className="text-ink-muted">Image</dt>
                  <dd>
                    {event.imageWidth}×{event.imageHeight}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Quality</dt>
                  <dd>{Math.round(event.quality * 100)}%</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Confidence</dt>
                  <dd>{event.confidence != null ? `${Math.round(event.confidence * 100)}%` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Result</dt>
                  <dd>
                    {event.action === "enroll"
                      ? event.templateCreated
                        ? "Template created"
                        : "Failed"
                      : event.matched
                        ? "Match"
                        : "No match"}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-ink-muted">Processing: {event.processingMs} ms</p>
              {event.note ? <p className="mt-1 text-ink-muted">{event.note}</p> : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
