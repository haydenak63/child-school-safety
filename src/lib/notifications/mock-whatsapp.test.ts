import { describe, expect, it } from "vitest";
import { MockWhatsAppProvider } from "@/lib/notifications/mock-whatsapp";

describe("MockWhatsAppProvider", () => {
  it("generates an arrival notification without calling a live API", async () => {
    const provider = new MockWhatsAppProvider();
    const result = await provider.sendArrivalNotification({
      studentName: "Ali Ahmed",
      schoolName: "ABC International School",
      time: "08:42 AM",
      gate: "Main Entrance",
      recipient: "+923001110001",
    });
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
      studentName: "Ali Ahmed",
      schoolName: "ABC International School",
      time: "02:17 PM",
      gate: "Main Exit",
      recipient: "+923001110001",
    });
    expect(result.message).toContain("School Departure Alert");
    expect(result.message).toContain("Ali Ahmed has left ABC International School.");
  });
});
