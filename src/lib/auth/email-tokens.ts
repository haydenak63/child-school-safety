import { hashPassword } from "@/lib/auth/password";
import { evaluateAuthToken, RESET_PASSWORD_TTL_MS, VERIFY_EMAIL_TTL_MS } from "@/lib/auth/token-state";
import { createSecureToken, hashToken } from "@/lib/crypto";
import { sendTransactionalEmail } from "@/lib/email/mailer";
import { renderResetPassword, renderVerifyEmail, renderWelcome } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export { evaluateAuthToken, RESET_PASSWORD_TTL_MS, VERIFY_EMAIL_TTL_MS } from "@/lib/auth/token-state";

export async function issueEmailVerification(admin: {
  id: string;
  email: string;
  name: string;
  school: { name: string };
}) {
  const now = new Date();
  await prisma.emailVerificationToken.updateMany({
    where: { adminId: admin.id, usedAt: null },
    data: { usedAt: now },
  });
  const token = createSecureToken();
  await prisma.emailVerificationToken.create({
    data: {
      adminId: admin.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + VERIFY_EMAIL_TTL_MS),
    },
  });
  const rendered = renderVerifyEmail({
    appUrl: getAppUrl(),
    token,
    schoolName: admin.school.name,
    ownerName: admin.name,
  });
  const mail = await sendTransactionalEmail({
    to: admin.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    template: "verify-email",
  });
  return { token, mailStatus: mail.status };
}

export async function consumeEmailVerification(plainToken: string): Promise<{
  state: "ok" | "invalid" | "expired" | "used";
  alreadyVerified: boolean;
}> {
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(plainToken) },
    include: { admin: { include: { school: true } } },
  });
  if (!row) return { state: "invalid", alreadyVerified: false };

  const state = evaluateAuthToken(row);
  if (state !== "ok") return { state, alreadyVerified: Boolean(row.admin.emailVerifiedAt) };

  const alreadyVerified = Boolean(row.admin.emailVerifiedAt);
  const verifiedAt = row.admin.emailVerifiedAt ?? new Date();
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.admin.update({
      where: { id: row.adminId },
      data: { emailVerifiedAt: verifiedAt },
    }),
  ]);

  if (!alreadyVerified) {
    const welcome = renderWelcome({
      appUrl: getAppUrl(),
      schoolName: row.admin.school.name,
      ownerName: row.admin.name,
    });
    await sendTransactionalEmail({
      to: row.admin.email,
      subject: welcome.subject,
      html: welcome.html,
      text: welcome.text,
      template: "welcome",
    });
  }

  return { state: "ok", alreadyVerified };
}

export async function issuePasswordReset(admin: {
  id: string;
  email: string;
  name: string;
  school: { name: string };
}) {
  const now = new Date();
  await prisma.passwordResetToken.updateMany({
    where: { adminId: admin.id, usedAt: null },
    data: { usedAt: now },
  });
  const token = createSecureToken();
  await prisma.passwordResetToken.create({
    data: {
      adminId: admin.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + RESET_PASSWORD_TTL_MS),
    },
  });
  const rendered = renderResetPassword({
    appUrl: getAppUrl(),
    token,
    schoolName: admin.school.name,
    ownerName: admin.name,
  });
  return sendTransactionalEmail({
    to: admin.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    template: "reset-password",
  });
}

export async function consumePasswordReset(plainToken: string, password: string): Promise<void> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(plainToken) },
    include: { admin: true },
  });
  if (!row) {
    throw new AppError("NOT_FOUND", "This reset link is invalid or has expired.", 404);
  }
  const state = evaluateAuthToken(row);
  if (state === "used") {
    throw new AppError("ENROLLMENT_USED", "This reset link has already been used.", 409);
  }
  if (state === "expired") {
    throw new AppError("ENROLLMENT_EXPIRED", "This reset link has expired. Request a new one.", 410);
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.admin.update({
      where: { id: row.adminId },
      data: {
        passwordHash,
        emailVerifiedAt: row.admin.emailVerifiedAt ?? new Date(),
      },
    }),
  ]);
}

export async function lookupResetToken(plainToken: string) {
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(plainToken) },
  });
  if (!row) return "invalid" as const;
  return evaluateAuthToken(row);
}
