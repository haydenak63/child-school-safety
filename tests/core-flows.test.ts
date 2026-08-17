import { describe, expect, it } from "vitest";
import { evaluateEnrollmentSession } from "@/lib/services/enrollment";
import { createSecureToken, hashToken } from "@/lib/crypto";
import { studentSchema, parentSchema, registerSchema, resetPasswordSchema } from "@/lib/validation";
import { evaluateAuthToken, VERIFY_EMAIL_TTL_MS, RESET_PASSWORD_TTL_MS } from "@/lib/auth/token-state";
import { listEmailTemplates, renderResetPassword, renderVerifyEmail, renderWelcome } from "@/lib/email/templates";

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

describe("auth email tokens", () => {
  it("stores only a SHA-256 hash of the one-time token", () => {
    const token = createSecureToken();
    const digest = hashToken(token);
    expect(digest).toHaveLength(64);
    expect(digest).not.toBe(token);
    expect(hashToken(token)).toBe(digest);
  });

  it("expires an unused verification token after 48 hours", () => {
    const issued = new Date("2026-08-15T10:00:00Z");
    const state = evaluateAuthToken(
      { expiresAt: new Date(issued.getTime() + VERIFY_EMAIL_TTL_MS), usedAt: null },
      new Date("2026-08-17T10:00:01Z"),
    );
    expect(state).toBe("expired");
  });

  it("expires an unused reset token after one hour", () => {
    const issued = new Date("2026-08-15T10:00:00Z");
    const state = evaluateAuthToken(
      { expiresAt: new Date(issued.getTime() + RESET_PASSWORD_TTL_MS), usedAt: null },
      new Date("2026-08-15T11:00:01Z"),
    );
    expect(state).toBe("expired");
  });

  it("rejects an already used auth token", () => {
    const state = evaluateAuthToken(
      { expiresAt: new Date("2026-08-17T10:00:00Z"), usedAt: new Date("2026-08-16T09:00:00Z") },
      new Date("2026-08-16T09:30:00Z"),
    );
    expect(state).toBe("used");
  });

  it("accepts a fresh unused auth token", () => {
    const state = evaluateAuthToken(
      { expiresAt: new Date("2026-08-17T10:00:00Z"), usedAt: null },
      new Date("2026-08-16T09:00:00Z"),
    );
    expect(state).toBe("ok");
  });
});

describe("school-owner auth validation", () => {
  it("accepts a complete registration payload", () => {
    const body = registerSchema.parse({
      schoolName: "ABC School",
      ownerName: "Ayesha Khan",
      email: "owner@abcschool.test",
      password: "securepass",
      confirmPassword: "securepass",
      timezone: "Asia/Karachi",
    });
    expect(body.schoolName).toBe("ABC School");
  });

  it("rejects a registration when passwords do not match", () => {
    const result = registerSchema.safeParse({
      schoolName: "ABC School",
      ownerName: "Ayesha Khan",
      email: "owner@abcschool.test",
      password: "securepass",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short reset password", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("transactional email templates", () => {
  it("lists verify, reset, and welcome templates", () => {
    expect(listEmailTemplates().map((item) => item.id)).toEqual([
      "verify-email",
      "reset-password",
      "welcome",
    ]);
  });

  it("renders a verify email with the school name and link", () => {
    const email = renderVerifyEmail({
      appUrl: "https://halo.example",
      token: "verify-token",
      schoolName: "ABC International School",
      ownerName: "Ayesha Khan",
    });
    expect(email.subject).toContain("ABC International School");
    expect(email.html).toContain("ABC International School");
    expect(email.html).toContain("https://halo.example/verify-email/verify-token");
    expect(email.text).toContain("https://halo.example/verify-email/verify-token");
  });

  it("renders a reset email with the school name and link", () => {
    const email = renderResetPassword({
      appUrl: "https://halo.example",
      token: "reset-token",
      schoolName: "ABC International School",
      ownerName: "Ayesha Khan",
    });
    expect(email.subject).toContain("ABC International School");
    expect(email.html).toContain("https://halo.example/reset-password/reset-token");
    expect(email.text).toContain("https://halo.example/reset-password/reset-token");
  });

  it("renders a welcome email with the school name and sign-in link", () => {
    const email = renderWelcome({
      appUrl: "https://halo.example",
      schoolName: "ABC International School",
      ownerName: "Ayesha Khan",
    });
    expect(email.subject).toContain("ABC International School");
    expect(email.html).toContain("ABC International School");
    expect(email.html).toContain("https://halo.example/login");
  });
});
