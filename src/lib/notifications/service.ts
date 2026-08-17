import { decryptString } from "@/lib/crypto";
import { IqPigeonProvider } from "@/lib/notifications/iq-pigeon";
import { MockWhatsAppProvider } from "@/lib/notifications/mock-whatsapp";
import { WhatsAppCloudProvider } from "@/lib/notifications/whatsapp-cloud";
import type {
  ArrivalNotificationInput,
  AttendanceEventType,
  NotificationDraft,
  NotificationProvider,
  NotificationService,
} from "@/lib/notifications/types";
import { prisma } from "@/lib/prisma";

/** Deployment-wide default, used by any school without its own integration. */
export function envNotificationProvider(): NotificationProvider {
  if (process.env.WHATSAPP_PROVIDER === "cloud") {
    return new WhatsAppCloudProvider();
  }
  return new MockWhatsAppProvider();
}

/**
 * Resolution is per school, not per process: this deployment serves several
 * schools and each one holds its own IQ Pigeon client credentials.
 */
export async function resolveNotificationService(schoolId: string): Promise<NotificationService> {
  const integration = await prisma.schoolIntegration.findUnique({ where: { schoolId } });
  if (!integration || !integration.enabled) {
    return envNotificationProvider();
  }
  return new IqPigeonProvider({
    baseUrl: integration.baseUrl,
    apiKey: decryptString(integration.apiKeyEncrypted),
    secret: decryptString(integration.secretEncrypted),
  });
}

function failureReason(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "the notification provider failed unexpectedly";
}

/**
 * Dispatches through the school's provider and never throws. Attendance is the
 * system of record; a WhatsApp hand-off failure must not undo a gate scan.
 */
export async function sendAttendanceNotification(
  schoolId: string,
  eventType: AttendanceEventType,
  input: ArrivalNotificationInput,
): Promise<NotificationDraft> {
  try {
    const service = await resolveNotificationService(schoolId);
    return eventType === "ARRIVAL"
      ? await service.sendArrivalNotification(input)
      : await service.sendDepartureNotification(input);
  } catch (error) {
    return {
      channel: "WHATSAPP",
      recipient: input.recipients[0].phone,
      message: `Notification not sent: ${failureReason(error)}`,
      status: "FAILED",
    };
  }
}
