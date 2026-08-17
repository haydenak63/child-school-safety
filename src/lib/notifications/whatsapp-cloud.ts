import { AppError } from "@/lib/errors";
import type {
  ArrivalNotificationInput,
  DepartureNotificationInput,
  NotificationDraft,
  NotificationProvider,
} from "@/lib/notifications/types";

export class WhatsAppCloudProvider implements NotificationProvider {
  async sendArrivalNotification(_input: ArrivalNotificationInput): Promise<NotificationDraft> {
    throw new AppError(
      "SERVER",
      "WhatsApp Cloud API provider is not enabled in this prototype. Use MockWhatsAppProvider.",
      501,
    );
  }

  async sendDepartureNotification(_input: DepartureNotificationInput): Promise<NotificationDraft> {
    throw new AppError(
      "SERVER",
      "WhatsApp Cloud API provider is not enabled in this prototype. Use MockWhatsAppProvider.",
      501,
    );
  }
}
