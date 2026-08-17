import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { decryptString } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { getPlatformSettings } from "@/lib/services/platform";

const DEFAULT_FROM = "Halo <noreply@localhost>";

export type MailStatus = "SENT" | "FAILED" | "SKIPPED";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  template: string;
}): Promise<{ status: MailStatus; error?: string }> {
  const transport = await resolveTransport();
  if (!transport) {
    await logEmail({ ...input, status: "SKIPPED" });
    return { status: "SKIPPED" };
  }

  try {
    await transport.transporter.sendMail({
      from: transport.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    await logEmail({ ...input, status: "SENT" });
    return { status: "SENT" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed.";
    console.error("Transactional email failed", message);
    await logEmail({ ...input, status: "FAILED", error: message });
    return { status: "FAILED", error: message };
  }
}

async function resolveTransport(): Promise<{ transporter: Transporter; from: string } | null> {
  const settings = await getPlatformSettings();
  if (settings.smtpEnabled && settings.smtpHost && settings.smtpPassEncrypted) {
    try {
      const pass = decryptString(settings.smtpPassEncrypted);
      return {
        from: settings.smtpFrom?.trim() || process.env.SMTP_FROM?.trim() || DEFAULT_FROM,
        transporter: nodemailer.createTransport({
          host: settings.smtpHost,
          port: settings.smtpPort,
          secure: settings.smtpPort === 465,
          auth: {
            user: settings.smtpUser || "",
            pass,
          },
        }),
      };
    } catch (error) {
      console.error(
        "Platform SMTP could not be used",
        error instanceof Error ? error.message : "unknown",
      );
    }
  }

  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" || port === 465;
  const user = process.env.SMTP_USER?.trim();

  return {
    from: process.env.SMTP_FROM?.trim() || DEFAULT_FROM,
    transporter: nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure,
      auth: user ? { user, pass: process.env.SMTP_PASS ?? "" } : undefined,
    }),
  };
}

async function logEmail(input: {
  to: string;
  subject: string;
  template: string;
  status: MailStatus;
  error?: string;
}): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        to: input.to,
        subject: input.subject,
        template: input.template,
        status: input.status,
        error: input.error,
      },
    });
  } catch (error) {
    console.error("EmailLog write failed", error instanceof Error ? error.message : "unknown");
  }
}
