import { z } from "zod";
import { AppError } from "@/lib/errors";

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
    .regex(/^\+[1-9]\d{7,14}$/, "WhatsApp number must be in E.164 format, e.g. +923001112223"),
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
