import { describe, expect, it } from "vitest";
import { evaluateEnrollmentSession } from "@/lib/services/enrollment";
import { createSecureToken, hashToken } from "@/lib/crypto";
import { studentSchema, parentSchema } from "@/lib/validation";

describe("student and parent validation", () => {
  it("accepts a valid student payload", () => {
    const student = studentSchema.parse({
      studentNumber: "STU-001",
      firstName: "Ali",
      lastName: "Ahmed",
      className: "Grade 5",
      section: "B",
    });
    expect(student.firstName).toBe("Ali");
  });

  it("associates a parent with an E.164 WhatsApp number", () => {
    const parent = parentSchema.parse({
      name: "Muhammad Ahmed",
      relationship: "Father",
      whatsappNumber: "+923001110001",
    });
    expect(parent.whatsappNumber).toBe("+923001110001");
  });
});

describe("enrollment tokens", () => {
  it("creates a hashed one-time token that does not contain the student id", () => {
    const token = createSecureToken();
    const digest = hashToken(token);
    expect(token).not.toContain("stu_");
    expect(digest).toHaveLength(64);
    expect(digest).not.toBe(token);
    expect(hashToken(token)).toBe(digest);
  });

  it("expires an unused enrollment session", () => {
    const state = evaluateEnrollmentSession(
      { expiresAt: new Date("2026-08-15T10:00:00Z"), usedAt: null },
      new Date("2026-08-15T10:05:01Z"),
    );
    expect(state).toBe("expired");
  });

  it("rejects an already used enrollment session", () => {
    const state = evaluateEnrollmentSession(
      { expiresAt: new Date("2026-08-15T10:10:00Z"), usedAt: new Date("2026-08-15T10:01:00Z") },
      new Date("2026-08-15T10:02:00Z"),
    );
    expect(state).toBe("used");
  });

  it("accepts a fresh unused enrollment session", () => {
    const state = evaluateEnrollmentSession(
      { expiresAt: new Date("2026-08-15T10:10:00Z"), usedAt: null },
      new Date("2026-08-15T10:04:00Z"),
    );
    expect(state).toBe("ok");
  });
});

describe("terminal authentication", () => {
  it("looks up terminals by token hash rather than plaintext", () => {
    const token = createSecureToken();
    const storedHash = hashToken(token);
    const attacker = createSecureToken();
    expect(hashToken(attacker)).not.toBe(storedHash);
    expect(hashToken(token)).toBe(storedHash);
  });
});
