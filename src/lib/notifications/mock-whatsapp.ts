import type {
  ArrivalNotificationInput,
  DepartureNotificationInput,
  NotificationDraft,
  NotificationProvider,
} from "@/lib/notifications/types";

function arrivalMessage(input: ArrivalNotificationInput): string {
  return [
    "🟢 School Arrival Alert",
    "",
    `${input.studentName} has arrived at ${input.schoolName}.`,
    "",
    `Time: ${input.time}`,
    `Gate: ${input.gate}`,
  ].join("\n");
}

function departureMessage(input: DepartureNotificationInput): string {
  return [
    "🔴 School Departure Alert",
    "",
    `${input.studentName} has left ${input.schoolName}.`,
    "",
    `Time: ${input.time}`,
    `Gate: ${input.gate}`,
  ].join("\n");
}

export class MockWhatsAppProvider implements NotificationProvider {
  async sendArrivalNotification(input: ArrivalNotificationInput): Promise<NotificationDraft> {
    return {
      channel: "WHATSAPP",
      recipient: input.recipient,
      message: arrivalMessage(input),
      status: "MOCKED",
    };
  }

  async sendDepartureNotification(input: DepartureNotificationInput): Promise<NotificationDraft> {
    return {
      channel: "WHATSAPP",
      recipient: input.recipient,
      message: departureMessage(input),
      status: "MOCKED",
    };
  }
}

export { arrivalMessage, departureMessage };
