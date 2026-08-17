import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildIngestPayload,
  buildIngestUrl,
  buildSignedRequest,
  classifyIngestResponse,
  IqPigeonProvider,
  signIngestRequest,
  unreachableOutcome,
} from "@/lib/notifications/iq-pigeon";
import type { ArrivalNotificationInput } from "@/lib/notifications/types";

const SECRET = "iqp_shared_secret_fixture";
const TIMESTAMP = 1755420120;

const INPUT: ArrivalNotificationInput = {
  eventId: "evt_fixture_0001",
  studentName: "Ali Ahmed",
  studentReference: "STU-001",
  schoolName: "ABC International School",
  schoolTimezone: "Asia/Karachi",
  occurredAt: new Date("2026-08-17T08:42:00.000Z"),
  time: "08:42 AM",
  gate: "Main Entrance",
  recipients: [{ name: "Muhammad Ahmed", phone: "+923001110001" }],
};

// The exact bytes the receiving side hashes for the fixture above.
const EXPECTED_RAW_BODY =
  '{"event_id":"evt_fixture_0001","event_type":"ARRIVAL","occurred_at":"2026-08-17T08:42:00.000Z",' +
  '"school":{"name":"ABC International School","timezone":"Asia/Karachi"},' +
  '"student":{"name":"Ali Ahmed","reference":"STU-001"},"gate":"Main Entrance",' +
  '"local_time":"08:42 AM","recipients":[{"name":"Muhammad Ahmed","phone":"+923001110001"}]}';

const EXPECTED_SIGNATURE = "fa3548ddc617b5538919562ccb08532d243e276dd532db789fb71fe37b3626fe";

const CONFIG = {
  baseUrl: "https://school.iqpigeon.test",
  apiKey: "iqp_sch_abcd1234",
  secret: SECRET,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("signIngestRequest", () => {
  it("matches a known-good HMAC over timestamp + '.' + rawBody", () => {
    expect(signIngestRequest(SECRET, TIMESTAMP, EXPECTED_RAW_BODY)).toBe(EXPECTED_SIGNATURE);
  });

  it("signs a hand-checked minimal fixture", () => {
    expect(signIngestRequest("test-secret", 1700000000, '{"ping":true}')).toBe(
      "0a8efb8a8c7721403ec3111f548fc05cdad358660be0e41d747517145e54b24e",
    );
  });

  it("returns lowercase hex", () => {
    const signature = signIngestRequest(SECRET, TIMESTAMP, EXPECTED_RAW_BODY);
    expect(signature).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes when the timestamp, body, or secret changes", () => {
    const base = signIngestRequest(SECRET, TIMESTAMP, EXPECTED_RAW_BODY);
    expect(signIngestRequest(SECRET, TIMESTAMP + 1, EXPECTED_RAW_BODY)).not.toBe(base);
    expect(signIngestRequest(SECRET, TIMESTAMP, `${EXPECTED_RAW_BODY} `)).not.toBe(base);
    expect(signIngestRequest(`${SECRET}x`, TIMESTAMP, EXPECTED_RAW_BODY)).not.toBe(base);
  });

  it("separates the timestamp from the body, so parts cannot be shifted across the dot", () => {
    expect(signIngestRequest(SECRET, 17554201, "20.body")).not.toBe(
      signIngestRequest(SECRET, 1755420120, "body"),
    );
  });
});

describe("buildIngestPayload", () => {
  it("produces the wire contract shape", () => {
    expect(buildIngestPayload("ARRIVAL", INPUT)).toEqual({
      event_id: "evt_fixture_0001",
      event_type: "ARRIVAL",
      occurred_at: "2026-08-17T08:42:00.000Z",
      school: { name: "ABC International School", timezone: "Asia/Karachi" },
      student: { name: "Ali Ahmed", reference: "STU-001" },
      gate: "Main Entrance",
      local_time: "08:42 AM",
      recipients: [{ name: "Muhammad Ahmed", phone: "+923001110001" }],
    });
  });

  it("serialises to the exact fixture body", () => {
    expect(JSON.stringify(buildIngestPayload("ARRIVAL", INPUT))).toBe(EXPECTED_RAW_BODY);
  });

  it("carries the departure event type", () => {
    expect(buildIngestPayload("DEPARTURE", INPUT).event_type).toBe("DEPARTURE");
  });

  it("never composes message text", () => {
    const payload = buildIngestPayload("ARRIVAL", INPUT) as Record<string, unknown>;
    expect(payload.message).toBeUndefined();
    expect(payload.template).toBeUndefined();
    expect(payload.body).toBeUndefined();
  });

  it("keeps event_id within the 64 character limit", () => {
    const payload = buildIngestPayload("ARRIVAL", { ...INPUT, eventId: "e".repeat(90) });
    expect(payload.event_id).toHaveLength(64);
  });

  it("passes every recipient through", () => {
    const payload = buildIngestPayload("ARRIVAL", {
      ...INPUT,
      recipients: [
        { name: "Muhammad Ahmed", phone: "+923001110001" },
        { name: "Sana Ahmed", phone: "+923001110002" },
      ],
    });
    expect(payload.recipients).toHaveLength(2);
    expect(payload.recipients[1]).toEqual({ name: "Sana Ahmed", phone: "+923001110002" });
  });
});

describe("buildIngestUrl", () => {
  it("appends the ingest path", () => {
    expect(buildIngestUrl("https://school.iqpigeon.test")).toBe(
      "https://school.iqpigeon.test/api/school-attendance-ingest.php",
    );
  });

  it("tolerates trailing slashes and surrounding whitespace", () => {
    expect(buildIngestUrl("  https://school.iqpigeon.test///  ")).toBe(
      "https://school.iqpigeon.test/api/school-attendance-ingest.php",
    );
  });

  it("keeps a base path prefix", () => {
    expect(buildIngestUrl("https://host.test/iqpigeon")).toBe(
      "https://host.test/iqpigeon/api/school-attendance-ingest.php",
    );
  });
});

describe("buildSignedRequest", () => {
  it("signs the same string it sends", () => {
    const request = buildSignedRequest(CONFIG, buildIngestPayload("ARRIVAL", INPUT), TIMESTAMP);
    expect(request.rawBody).toBe(EXPECTED_RAW_BODY);
    expect(request.headers["X-IQP-Signature"]).toBe(EXPECTED_SIGNATURE);
    expect(request.headers["X-IQP-Signature"]).toBe(
      signIngestRequest(SECRET, TIMESTAMP, request.rawBody),
    );
  });

  it("sets the documented headers", () => {
    const request = buildSignedRequest(CONFIG, buildIngestPayload("ARRIVAL", INPUT), TIMESTAMP);
    expect(request.headers["Content-Type"]).toBe("application/json");
    expect(request.headers.Authorization).toBe("Bearer iqp_sch_abcd1234");
    expect(request.headers["X-IQP-Timestamp"]).toBe("1755420120");
  });

  it("defaults the timestamp to unix epoch seconds", () => {
    const request = buildSignedRequest(CONFIG, buildIngestPayload("ARRIVAL", INPUT));
    const sent = Number(request.headers["X-IQP-Timestamp"]);
    expect(Number.isInteger(sent)).toBe(true);
    expect(Math.abs(sent - Math.floor(Date.now() / 1000))).toBeLessThan(5);
  });
});

describe("classifyIngestResponse", () => {
  it("accepts a 202 and reports the queued count", () => {
    const outcome = classifyIngestResponse(202, {
      ok: true,
      event_id: "evt_fixture_0001",
      queued: 2,
      duplicate: false,
    });
    expect(outcome.kind).toBe("ACCEPTED");
    expect(outcome.ok).toBe(true);
    expect(outcome.transient).toBe(false);
    expect(outcome.queued).toBe(2);
    expect(outcome.message).toContain("queued 2 WhatsApp messages");
  });

  it("treats a 200 duplicate as success that must not be retried", () => {
    const outcome = classifyIngestResponse(200, {
      ok: true,
      event_id: "evt_fixture_0001",
      queued: 0,
      duplicate: true,
    });
    expect(outcome.kind).toBe("DUPLICATE");
    expect(outcome.ok).toBe(true);
    expect(outcome.transient).toBe(false);
  });

  it("treats 401, 403 and 422 as permanent failures", () => {
    for (const [status, kind] of [
      [401, "AUTH_FAILED"],
      [403, "REMOTE_DISABLED"],
      [422, "INVALID_PAYLOAD"],
    ] as const) {
      const outcome = classifyIngestResponse(status, { ok: false, error: "nope" });
      expect(outcome.kind).toBe(kind);
      expect(outcome.ok).toBe(false);
      expect(outcome.transient).toBe(false);
    }
  });

  it("distinguishes a lapsed IQ Pigeon subscription from revoked access", () => {
    const outcome = classifyIngestResponse(403, {
      ok: false,
      error_code: "SUBSCRIPTION_INACTIVE",
      error: "Subscription inactive",
    });
    expect(outcome.kind).toBe("SUBSCRIPTION_INACTIVE");
    expect(outcome.ok).toBe(false);
    expect(outcome.transient).toBe(false);
    expect(outcome.message).toContain("subscription is inactive");
  });

  it("treats 429 and 5xx as transient failures", () => {
    for (const [status, kind] of [
      [429, "RATE_LIMITED"],
      [500, "SERVER_ERROR"],
      [503, "SERVER_ERROR"],
    ] as const) {
      const outcome = classifyIngestResponse(status, null);
      expect(outcome.kind).toBe(kind);
      expect(outcome.ok).toBe(false);
      expect(outcome.transient).toBe(true);
    }
  });

  it("surfaces the server-provided reason to the admin", () => {
    const outcome = classifyIngestResponse(422, { error: "recipients[0].phone is invalid" });
    expect(outcome.message).toContain("recipients[0].phone is invalid");
  });

  it("falls back to a permanent unexpected outcome", () => {
    const outcome = classifyIngestResponse(418, null);
    expect(outcome.kind).toBe("UNEXPECTED");
    expect(outcome.transient).toBe(false);
  });

  it("survives a non-JSON body", () => {
    const outcome = classifyIngestResponse(500, null);
    expect(outcome.kind).toBe("SERVER_ERROR");
    expect(outcome.queued).toBe(0);
  });
});

describe("unreachableOutcome", () => {
  it("names the host and stays transient", () => {
    const outcome = unreachableOutcome(CONFIG.baseUrl, new TypeError("fetch failed"));
    expect(outcome.kind).toBe("UNREACHABLE");
    expect(outcome.transient).toBe(true);
    expect(outcome.httpStatus).toBeNull();
    expect(outcome.message).toContain("school.iqpigeon.test");
  });

  it("calls out a timeout separately", () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    expect(unreachableOutcome(CONFIG.baseUrl, timeout).message).toContain("timed out");
  });
});

describe("IqPigeonProvider", () => {
  function stubFetch(status: number, body: unknown) {
    const calls: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    });
    return calls;
  }

  it("posts a signed request the receiving side can verify", async () => {
    const calls = stubFetch(202, { ok: true, queued: 1, duplicate: false });
    const draft = await new IqPigeonProvider(CONFIG).sendArrivalNotification(INPUT);

    expect(calls).toHaveLength(1);
    const { url, init } = calls[0];
    expect(url).toBe("https://school.iqpigeon.test/api/school-attendance-ingest.php");
    expect(init.method).toBe("POST");

    const headers = init.headers as Record<string, string>;
    const rawBody = init.body as string;
    expect(rawBody).toBe(EXPECTED_RAW_BODY);
    // Recompute exactly as the PHP side will: over the bytes actually sent.
    expect(headers["X-IQP-Signature"]).toBe(
      signIngestRequest(SECRET, Number(headers["X-IQP-Timestamp"]), rawBody),
    );
    expect(draft.status).toBe("SENT");
    expect(draft.recipient).toBe("+923001110001");
  });

  it("sends DEPARTURE for a departure", async () => {
    const calls = stubFetch(202, { ok: true, queued: 1 });
    await new IqPigeonProvider(CONFIG).sendDepartureNotification(INPUT);
    expect(JSON.parse(calls[0].init.body as string).event_type).toBe("DEPARTURE");
  });

  it("records a duplicate as sent rather than failed", async () => {
    stubFetch(200, { ok: true, queued: 0, duplicate: true });
    const draft = await new IqPigeonProvider(CONFIG).sendArrivalNotification(INPUT);
    expect(draft.status).toBe("SENT");
  });

  it("marks rejected credentials as failed without throwing", async () => {
    stubFetch(401, { ok: false, error: "invalid api key" });
    const draft = await new IqPigeonProvider(CONFIG).sendArrivalNotification(INPUT);
    expect(draft.status).toBe("FAILED");
    expect(draft.message).toContain("Credentials rejected");
  });

  it("returns a failed draft instead of throwing when the host is unreachable", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    const draft = await new IqPigeonProvider(CONFIG).sendArrivalNotification(INPUT);
    expect(draft.status).toBe("FAILED");
    expect(draft.message).toContain("Could not reach");
  });
});
