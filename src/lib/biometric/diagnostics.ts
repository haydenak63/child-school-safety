import { isDemoMode } from "@/lib/env";

export type DiagnosticEvent = {
  id: string;
  at: string;
  action: "enroll" | "identify";
  imageWidth: number;
  imageHeight: number;
  quality: number;
  confidence?: number;
  matched?: boolean;
  processingMs: number;
  templateCreated?: boolean;
  note?: string;
};

const events: DiagnosticEvent[] = [];
const MAX = 40;

export function recordDiagnostic(event: Omit<DiagnosticEvent, "id" | "at">): void {
  if (!isDemoMode()) return;
  events.unshift({
    ...event,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString(),
  });
  events.splice(MAX);
}

export function listDiagnostics(): DiagnosticEvent[] {
  return isDemoMode() ? [...events] : [];
}
