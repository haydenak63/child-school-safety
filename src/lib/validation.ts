import { z } from "zod";
import { AppError } from "@/lib/errors";

const E164_PHONE = /^\+[1-9]\d{7,14}$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const studentSchema = z.object({
  studentNumber: z.string().trim().min(1).max(40),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  photo: z.string().trim().max(500).optional().or(z.literal("")),
  className: z.string().trim().min(1).max(40),
  section: z.string().trim().min(1).max(20),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const parentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  relationship: z.string().trim().min(1).max(40),
  whatsappNumber: z
    .string()
    .trim()
    .regex(E164_PHONE, "WhatsApp number must be in E.164 format, e.g. +923001112223"),
  isPrimary: z.boolean().optional(),
});

export const terminalSchema = z.object({
  name: z.string().trim().min(1).max(80),
  location: z.string().trim().min(1).max(120),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  address: z.string().trim().min(1).max(240).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  scanCooldownSeconds: z.number().int().min(3).max(120).optional(),
  matchThreshold: z.number().min(0.35).max(0.95).optional(),
});

export const integrationSettingsSchema = z.object({
  enabled: z.boolean(),
  baseUrl: z
    .string()
    .trim()
    .min(1, "Enter the IQ Pigeon base URL.")
    .max(300)
    .refine(isHttpUrl, "Base URL must be a full http:// or https:// address."),
  // Blank means "keep the value already stored", so the admin can change one
  // credential, or just the base URL, without retyping the others.
  apiKey: z.string().trim().max(200).optional(),
  secret: z.string().trim().max(400).optional(),
});

export const platformBillingSchema = z.object({
  billingEnabled: z.boolean(),
  trialDays: z.number().int().min(0).max(90),
  stripeEnabled: z.boolean(),
  stripeMode: z.enum(["TEST", "LIVE"]),
  stripePublishableKey: z.string().trim().max(200).optional().or(z.literal("")),
  stripeSecret: z.string().trim().max(400).optional().or(z.literal("")),
  stripeWebhookSecret: z.string().trim().max(400).optional().or(z.literal("")),
  paypakEnabled: z.boolean(),
  paypakMerchantId: z.string().trim().max(120).optional().or(z.literal("")),
  paypakApiUrl: z.string().trim().max(300).optional().or(z.literal("")),
  paypakSecret: z.string().trim().max(400).optional().or(z.literal("")),
  jazzcashEnabled: z.boolean(),
  jazzcashMerchantId: z.string().trim().max(120).optional().or(z.literal("")),
  jazzcashPassword: z.string().trim().max(400).optional().or(z.literal("")),
  jazzcashIntegrity: z.string().trim().max(400).optional().or(z.literal("")),
});

export const smtpSettingsSchema = z.object({
  smtpEnabled: z.boolean(),
  smtpHost: z.string().trim().max(200).optional().or(z.literal("")),
  smtpPort: z.number().int().min(1).max(65535),
  smtpUser: z.string().trim().max(200).optional().or(z.literal("")),
  smtpFrom: z.string().trim().max(200).optional().or(z.literal("")),
  smtpPassword: z.string().trim().max(400).optional().or(z.literal("")),
});

export const assignPlanSchema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "CAMPUS"]),
  manual: z.boolean().optional(),
});

export const integrationTestSchema = z.object({
  testRecipient: z
    .string()
    .trim()
    .regex(E164_PHONE, "Test recipient must be in E.164 format, e.g. +923001112223")
    .optional()
    .or(z.literal("")),
});

export const captureSchema = z.object({
  image: z.string().min(32),
  finger: z.string().trim().max(40).optional(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new AppError("VALIDATION", issue?.message ?? "Invalid input.");
  }
  return result.data;
}
