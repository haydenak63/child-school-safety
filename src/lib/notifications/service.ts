import { MockWhatsAppProvider } from "@/lib/notifications/mock-whatsapp";
import { WhatsAppCloudProvider } from "@/lib/notifications/whatsapp-cloud";
import type { NotificationProvider, NotificationService } from "@/lib/notifications/types";

function createProvider(): NotificationProvider {
  if (process.env.WHATSAPP_PROVIDER === "cloud") {
    return new WhatsAppCloudProvider();
  }
  return new MockWhatsAppProvider();
}

const provider = createProvider();

export const notificationService: NotificationService = {
  sendArrivalNotification: (input) => provider.sendArrivalNotification(input),
  sendDepartureNotification: (input) => provider.sendDepartureNotification(input),
};
