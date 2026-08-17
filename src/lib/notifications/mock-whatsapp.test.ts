import { describe, expect, it } from "vitest";
import { MockWhatsAppProvider } from "@/lib/notifications/mock-whatsapp";
import type { ArrivalNotificationInput } from "@/lib/notifications/types";

const INPUT: ArrivalNotificationInput = {
  eventId: "evt_mock_0001",
  studentName: "Ali Ahmed",
  studentReference: "STU-001",
  schoolName: "ABC International School",
  schoolTimezone: "Asia/Karachi",
  occurredAt: new Date("2026-08-17T08:42:00.000Z"),
  time: "08:42 AM",
  gate: "Main Entrance",
  recipients: [{ name: "Muhammad Ahmed", phone: "+923001110001" }],
};

describe("MockWhatsAppProvider", () => {
  it("generates an arrival notification without calling a live API", async () => {
    const provider = new MockWhatsAppProvider();
    const result = await provider.sendArrivalNotification(INPUT);
    expect(result.status).toBe("MOCKED");
    expect(result.channel).toBe("WHATSAPP");
    expect(result.recipient).toBe("+923001110001");
    expect(result.message).toContain("School Arrival Alert");
    expect(result.message).toContain("Ali Ahmed has arrived at ABC International School.");
    expect(result.message).toContain("Gate: Main Entrance");
  });

  it("generates a departure notification", async () => {
    const provider = new MockWhatsAppProvider();
    const result = await provider.sendDepartureNotification({
      ...INPUT,
      time: "02:17 PM",
      gate: "Main Exit",
    });
    expect(result.message).toContain("School Departure Alert");
    expect(result.message).toContain("Ali Ahmed has left ABC International School.");
  });
});
