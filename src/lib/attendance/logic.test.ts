import { describe, expect, it } from "vitest";
import { isWithinCooldown, remainingCooldownSeconds, resolveEventType } from "@/lib/attendance/logic";

describe("arrival and departure logic", () => {
  it("records ARRIVAL when no event exists today", () => {
    expect(resolveEventType(null)).toBe("ARRIVAL");
  });

  it("records ARRIVAL after a DEPARTURE", () => {
    expect(resolveEventType("DEPARTURE")).toBe("ARRIVAL");
  });

  it("records DEPARTURE after an ARRIVAL", () => {
    expect(resolveEventType("ARRIVAL")).toBe("DEPARTURE");
  });

  it("ignores a duplicate scan inside the cooldown window", () => {
    const last = new Date("2026-08-15T08:42:00Z");
    const now = new Date("2026-08-15T08:42:07Z");
    expect(isWithinCooldown(last, now, 10)).toBe(true);
    expect(remainingCooldownSeconds(last, now, 10)).toBe(3);
  });

  it("allows a scan after the cooldown window", () => {
    const last = new Date("2026-08-15T08:42:00Z");
    const now = new Date("2026-08-15T08:42:11Z");
    expect(isWithinCooldown(last, now, 10)).toBe(false);
  });
});
