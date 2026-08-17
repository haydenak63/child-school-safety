import { randomUUID } from "crypto";
import type { IntegrationTestStatus, SchoolIntegration } from "@prisma/client";
import { decryptString, encryptString } from "@/lib/crypto";
import { formatTimeShort } from "@/lib/dates";
import { AppError } from "@/lib/errors";
import {
  buildIngestUrl,
  sendIngestEvent,
  type IqPigeonOutcome,
  type IqPigeonOutcomeKind,
} from "@/lib/notifications/iq-pigeon";
import { prisma } from "@/lib/prisma";

/**
 * Recipient used when the admin does not name one. IQ Pigeon will queue a
 * message for it, so the number is deliberately unroutable.
 */
export const TEST_RECIPIENT_FALLBACK = "+10000000000";

export const TEST_STUDENT_REFERENCE = "CSS-TEST";

/** Lets IQ Pigeon operators recognise a connection check in their own logs. */
export const TEST_EVENT_ID_PREFIX = "csstest_";

export type IntegrationView = {
  configured: boolean;
  enabled: boolean;
  baseUrl: string;
  /** Last four characters only. The stored secrets never leave the server. */
  apiKeyHint: string | null;
  secretHint: string | null;
  ingestUrl: string | null;
  lastTestedAt: string | null;
  lastStatus: IntegrationTestStatus | null;
  lastError: string | null;
};

const EMPTY_VIEW: IntegrationView = {
  configured: false,
  enabled: false,
  baseUrl: "",
  apiKeyHint: null,
  secretHint: null,
  ingestUrl: null,
  lastTestedAt: null,
  lastStatus: null,
  lastError: null,
};

function hint(secret: string): string {
  return secret.trim().slice(-4);
}

export function integrationView(integration: SchoolIntegration | null): IntegrationView {
  if (!integration) return EMPTY_VIEW;
  return {
    configured: true,
    enabled: integration.enabled,
    baseUrl: integration.baseUrl,
    apiKeyHint: integration.apiKeyHint || null,
    secretHint: integration.secretHint || null,
    ingestUrl: buildIngestUrl(integration.baseUrl),
    lastTestedAt: integration.lastTestedAt?.toISOString() ?? null,
    lastStatus: integration.lastStatus,
    lastError: integration.lastError,
  };
}

export async function getSchoolIntegration(schoolId: string): Promise<IntegrationView> {
  return integrationView(await prisma.schoolIntegration.findUnique({ where: { schoolId } }));
}

export async function saveSchoolIntegration(options: {
  schoolId: string;
  enabled: boolean;
  baseUrl: string;
  apiKey?: string;
  secret?: string;
}): Promise<IntegrationView> {
  const existing = await prisma.schoolIntegration.findUnique({
    where: { schoolId: options.schoolId },
  });
  const apiKey = options.apiKey?.trim() || undefined;
  const secret = options.secret?.trim() || undefined;

  if (!existing && (!apiKey || !secret)) {
    throw new AppError(
      "VALIDATION",
      "Enter both the IQ Pigeon API key and the shared secret to connect this school.",
    );
  }

  const credentials = {
    ...(apiKey ? { apiKeyEncrypted: encryptString(apiKey), apiKeyHint: hint(apiKey) } : {}),
    ...(secret ? { secretEncrypted: encryptString(secret), secretHint: hint(secret) } : {}),
  };

  // A diagnostic from the previous credentials or host would misrepresent the
  // connection the admin is looking at, so it is cleared alongside the change.
  const changed = apiKey || secret || (existing && existing.baseUrl !== options.baseUrl);
  const diagnostics = changed
    ? { lastTestedAt: null, lastStatus: null, lastError: null }
    : {};

  const saved = await prisma.schoolIntegration.upsert({
    where: { schoolId: options.schoolId },
    create: {
      schoolId: options.schoolId,
      enabled: options.enabled,
      baseUrl: options.baseUrl,
      apiKeyEncrypted: credentials.apiKeyEncrypted ?? "",
      apiKeyHint: credentials.apiKeyHint ?? "",
      secretEncrypted: credentials.secretEncrypted ?? "",
      secretHint: credentials.secretHint ?? "",
    },
    update: {
      enabled: options.enabled,
      baseUrl: options.baseUrl,
      ...credentials,
      ...diagnostics,
    },
  });

  return integrationView(saved);
}

function testStatusFor(kind: IqPigeonOutcomeKind): IntegrationTestStatus {
  return kind === "ACCEPTED" || kind === "DUPLICATE" ? "OK" : kind;
}

export type IntegrationTestResult = {
  ok: boolean;
  transient: boolean;
  status: IntegrationTestStatus;
  httpStatus: number | null;
  queued: number;
  message: string;
  testedAt: string;
};

/**
 * Runs a real signed request against the school's IQ Pigeon host. The connection
 * does not have to be enabled first, so an admin can verify credentials before
 * routing live gate events through them.
 */
export async function testSchoolIntegration(options: {
  schoolId: string;
  testRecipient?: string;
}): Promise<IntegrationTestResult> {
  const [integration, school] = await Promise.all([
    prisma.schoolIntegration.findUnique({ where: { schoolId: options.schoolId } }),
    prisma.school.findUnique({ where: { id: options.schoolId } }),
  ]);

  if (!integration || !school) {
    throw new AppError(
      "NOT_FOUND",
      "Save the IQ Pigeon base URL and credentials before running a test.",
      404,
    );
  }

  const now = new Date();
  let outcome: IqPigeonOutcome;
  try {
    outcome = await sendIngestEvent(
      {
        baseUrl: integration.baseUrl,
        apiKey: decryptString(integration.apiKeyEncrypted),
        secret: decryptString(integration.secretEncrypted),
      },
      {
        event_id: `${TEST_EVENT_ID_PREFIX}${randomUUID()}`,
        event_type: "ARRIVAL",
        occurred_at: now.toISOString(),
        school: { name: school.name, timezone: school.timezone },
        student: { name: "CSS Connection Test", reference: TEST_STUDENT_REFERENCE },
        gate: "Connection test",
        local_time: formatTimeShort(now, school.timezone),
        recipients: [
          {
            name: "CSS Connection Test",
            phone: options.testRecipient?.trim() || TEST_RECIPIENT_FALLBACK,
          },
        ],
      },
    );
  } catch {
    throw new AppError(
      "SERVER",
      "The stored IQ Pigeon credentials could not be read. Re-enter the API key and shared secret.",
      500,
    );
  }

  const status = testStatusFor(outcome.kind);
  await prisma.schoolIntegration.update({
    where: { id: integration.id },
    data: {
      lastTestedAt: now,
      lastStatus: status,
      lastError: outcome.ok ? null : outcome.message,
    },
  });

  return {
    ok: outcome.ok,
    transient: outcome.transient,
    status,
    httpStatus: outcome.httpStatus,
    queued: outcome.queued,
    message: outcome.message,
    testedAt: now.toISOString(),
  };
}
