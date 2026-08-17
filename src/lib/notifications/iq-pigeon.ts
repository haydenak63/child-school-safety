import { createHmac } from "crypto";
import type {
  ArrivalNotificationInput,
  AttendanceEventType,
  DepartureNotificationInput,
  NotificationDraft,
  NotificationProvider,
} from "@/lib/notifications/types";

export const IQ_PIGEON_INGEST_PATH = "/api/school-attendance-ingest.php";

export const IQ_PIGEON_TIMEOUT_MS = 10_000;

/** The receiving side caps event_id at 64 characters. */
export const IQ_PIGEON_EVENT_ID_MAX = 64;

export type IqPigeonConfig = {
  baseUrl: string;
  apiKey: string;
  secret: string;
  timeoutMs?: number;
};

export type IqPigeonPayload = {
  event_id: string;
  event_type: AttendanceEventType;
  occurred_at: string;
  school: { name: string; timezone: string };
  student: { name: string; reference: string };
  gate: string;
  local_time: string;
  recipients: { name: string; phone: string }[];
};

export type IqPigeonOutcomeKind =
  | "ACCEPTED"
  | "DUPLICATE"
  | "AUTH_FAILED"
  | "REMOTE_DISABLED"
  | "SUBSCRIPTION_INACTIVE"
  | "INVALID_PAYLOAD"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "UNREACHABLE"
  | "UNEXPECTED";

export type IqPigeonOutcome = {
  kind: IqPigeonOutcomeKind;
  /** Accepted or already-known duplicate: the parents will be messaged exactly once. */
  ok: boolean;
  /** Worth retrying later. Permanent failures need an admin to change something. */
  transient: boolean;
  httpStatus: number | null;
  queued: number;
  duplicate: boolean;
  /** Admin-facing sentence, reused by the settings UI and the notification log. */
  message: string;
};

export function buildIngestUrl(baseUrl: string): string {
  return `${baseUrl.trim().replace(/\/+$/, "")}${IQ_PIGEON_INGEST_PATH}`;
}

/**
 * Signs `timestamp + "." + rawBody`. `rawBody` must be the exact string put on
 * the wire — re-serialising the object would produce a body the far side hashes
 * differently, and every request would fail the signature check.
 */
export function signIngestRequest(secret: string, timestamp: number, rawBody: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

export function buildIngestPayload(
  eventType: AttendanceEventType,
  input: ArrivalNotificationInput,
): IqPigeonPayload {
  return {
    event_id: input.eventId.slice(0, IQ_PIGEON_EVENT_ID_MAX),
    event_type: eventType,
    occurred_at: input.occurredAt.toISOString(),
    school: { name: input.schoolName, timezone: input.schoolTimezone },
    student: { name: input.studentName, reference: input.studentReference },
    gate: input.gate,
    local_time: input.time,
    recipients: input.recipients.map((recipient) => ({
      name: recipient.name,
      phone: recipient.phone,
    })),
  };
}

export type SignedIngestRequest = {
  url: string;
  rawBody: string;
  headers: Record<string, string>;
};

export function buildSignedRequest(
  config: IqPigeonConfig,
  payload: IqPigeonPayload,
  timestamp: number = Math.floor(Date.now() / 1000),
): SignedIngestRequest {
  const rawBody = JSON.stringify(payload);
  return {
    url: buildIngestUrl(config.baseUrl),
    rawBody,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "X-IQP-Timestamp": String(timestamp),
      "X-IQP-Signature": signIngestRequest(config.secret, timestamp, rawBody),
    },
  };
}

function detailFrom(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  for (const key of ["error", "message"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 300);
  }
  return null;
}

function withDetail(message: string, detail: string | null): string {
  return detail ? `${message} IQ Pigeon said: ${detail}` : message;
}

export function classifyIngestResponse(httpStatus: number, body: unknown): IqPigeonOutcome {
  const record = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const detail = detailFrom(body);
  const queued = typeof record.queued === "number" ? record.queued : 0;
  const duplicate = record.duplicate === true;
  const base = { httpStatus, queued, duplicate };

  if (httpStatus === 200 && duplicate) {
    return {
      ...base,
      kind: "DUPLICATE",
      ok: true,
      transient: false,
      message: "IQ Pigeon had already accepted this event, so nothing was sent twice.",
    };
  }

  if (httpStatus === 202 || httpStatus === 200) {
    return {
      ...base,
      kind: "ACCEPTED",
      ok: true,
      transient: false,
      message: `IQ Pigeon accepted the event and queued ${queued} WhatsApp message${
        queued === 1 ? "" : "s"
      }.`,
    };
  }

  if (httpStatus === 401) {
    return {
      ...base,
      kind: "AUTH_FAILED",
      ok: false,
      transient: false,
      message: withDetail(
        "Credentials rejected. IQ Pigeon did not accept the API key or the request signature.",
        detail,
      ),
    };
  }

  if (httpStatus === 403) {
    const code = typeof record.error_code === "string" ? record.error_code : "";
    if (code === "SUBSCRIPTION_INACTIVE") {
      return {
        ...base,
        kind: "SUBSCRIPTION_INACTIVE",
        ok: false,
        transient: false,
        message: withDetail(
          "IQ Pigeon paused this school because the WhatsApp account subscription is inactive.",
          detail,
        ),
      };
    }
    return {
      ...base,
      kind: "REMOTE_DISABLED",
      ok: false,
      transient: false,
      message: withDetail(
        "This connection is disabled on the IQ Pigeon side. Ask IQ Pigeon to enable it for this school.",
        detail,
      ),
    };
  }

  if (httpStatus === 422) {
    return {
      ...base,
      kind: "INVALID_PAYLOAD",
      ok: false,
      transient: false,
      message: withDetail("IQ Pigeon rejected the event data as invalid.", detail),
    };
  }

  if (httpStatus === 429) {
    return {
      ...base,
      kind: "RATE_LIMITED",
      ok: false,
      transient: true,
      message: withDetail(
        "IQ Pigeon is rate limiting this connection. Try again in a moment.",
        detail,
      ),
    };
  }

  if (httpStatus >= 500) {
    return {
      ...base,
      kind: "SERVER_ERROR",
      ok: false,
      transient: true,
      message: withDetail(
        `IQ Pigeon returned a server error (HTTP ${httpStatus}). This is usually temporary.`,
        detail,
      ),
    };
  }

  return {
    ...base,
    kind: "UNEXPECTED",
    ok: false,
    transient: false,
    message: withDetail(`Unexpected response from IQ Pigeon (HTTP ${httpStatus}).`, detail),
  };
}

export function unreachableOutcome(baseUrl: string, error: unknown): IqPigeonOutcome {
  const timedOut =
    error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
  let host = baseUrl.trim();
  try {
    host = new URL(buildIngestUrl(baseUrl)).host;
  } catch {
    // Keep the raw value; the admin still needs to see what was attempted.
  }
  return {
    kind: "UNREACHABLE",
    ok: false,
    transient: true,
    httpStatus: null,
    queued: 0,
    duplicate: false,
    message: timedOut
      ? `Could not reach ${host}: the request timed out. Check that the IQ Pigeon server is online.`
      : `Could not reach ${host}. Check the base URL and that the IQ Pigeon server is online.`,
  };
}

export async function sendIngestEvent(
  config: IqPigeonConfig,
  payload: IqPigeonPayload,
): Promise<IqPigeonOutcome> {
  const request = buildSignedRequest(config, payload);
  let response: Response;
  try {
    response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: request.rawBody,
      signal: AbortSignal.timeout(config.timeoutMs ?? IQ_PIGEON_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    return unreachableOutcome(config.baseUrl, error);
  }

  // A PHP fatal error answers with HTML, so a parse failure must not throw here.
  const body = await response.json().catch(() => null);
  return classifyIngestResponse(response.status, body);
}

export class IqPigeonProvider implements NotificationProvider {
  constructor(private readonly config: IqPigeonConfig) {}

  async sendArrivalNotification(input: ArrivalNotificationInput): Promise<NotificationDraft> {
    return this.send("ARRIVAL", input);
  }

  async sendDepartureNotification(input: DepartureNotificationInput): Promise<NotificationDraft> {
    return this.send("DEPARTURE", input);
  }

  async send(
    eventType: AttendanceEventType,
    input: ArrivalNotificationInput,
  ): Promise<NotificationDraft> {
    const outcome = await sendIngestEvent(this.config, buildIngestPayload(eventType, input));
    return {
      channel: "WHATSAPP",
      recipient: input.recipients[0].phone,
      // CSS never composes WhatsApp copy: IQ Pigeon owns the approved template.
      // The log therefore records the hand-off result, not a message body.
      message: `IQ Pigeon ${eventType.toLowerCase()} hand-off: ${outcome.message}`,
      status: outcome.ok ? "SENT" : "FAILED",
    };
  }
}
