import { prisma } from "@/lib/prisma";
import { encryptString } from "@/lib/crypto";
import { AppError } from "@/lib/errors";
import type { GatewayMode, PlatformSettings } from "@prisma/client";

export const PLATFORM_SETTINGS_ID = "default";

export function secretHint(value: string): string {
  const trimmed = value.replace(/\s/g, "");
  if (trimmed.length < 4) return "••••";
  return trimmed.slice(-4);
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  return prisma.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: { id: PLATFORM_SETTINGS_ID },
    update: {},
  });
}

export async function isPlatformOperator(adminId: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { platformOperator: true },
  });
  if (admin?.platformOperator) return true;

  // Existing deployments have no operator flag yet. Until one is designated,
  // the earliest admin can configure gateways so the Payments tab is reachable.
  const designated = await prisma.admin.count({ where: { platformOperator: true } });
  if (designated > 0) return false;
  const first = await prisma.admin.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return first?.id === adminId;
}

export async function requirePlatformOperator(adminId: string): Promise<void> {
  if (!(await isPlatformOperator(adminId))) {
    throw new AppError("FORBIDDEN", "Only a platform operator can change these settings.", 403);
  }
}

export type GatewayPublicView = {
  billingEnabled: boolean;
  currency: string;
  trialDays: number;
  stripe: {
    enabled: boolean;
    mode: GatewayMode;
    publishableKey: string;
    hasSecret: boolean;
    secretHint: string | null;
    hasWebhook: boolean;
    webhookHint: string | null;
  };
  paypak: {
    enabled: boolean;
    merchantId: string;
    apiUrl: string;
    hasSecret: boolean;
    secretHint: string | null;
  };
  jazzcash: {
    enabled: boolean;
    merchantId: string;
    hasPassword: boolean;
    passwordHint: string | null;
    hasIntegrity: boolean;
    integrityHint: string | null;
  };
  smtp: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    from: string;
    hasPassword: boolean;
    passwordHint: string | null;
  };
};

export function toGatewayPublicView(settings: PlatformSettings): GatewayPublicView {
  return {
    billingEnabled: settings.billingEnabled,
    currency: settings.currency,
    trialDays: settings.trialDays,
    stripe: {
      enabled: settings.stripeEnabled,
      mode: settings.stripeMode,
      publishableKey: settings.stripePublishableKey ?? "",
      hasSecret: Boolean(settings.stripeSecretEncrypted),
      secretHint: settings.stripeSecretHint,
      hasWebhook: Boolean(settings.stripeWebhookSecretEncrypted),
      webhookHint: settings.stripeWebhookHint,
    },
    paypak: {
      enabled: settings.paypakEnabled,
      merchantId: settings.paypakMerchantId ?? "",
      apiUrl: settings.paypakApiUrl ?? "",
      hasSecret: Boolean(settings.paypakSecretEncrypted),
      secretHint: settings.paypakSecretHint,
    },
    jazzcash: {
      enabled: settings.jazzcashEnabled,
      merchantId: settings.jazzcashMerchantId ?? "",
      hasPassword: Boolean(settings.jazzcashPasswordEncrypted),
      passwordHint: settings.jazzcashPasswordHint,
      hasIntegrity: Boolean(settings.jazzcashIntegrityEncrypted),
      integrityHint: settings.jazzcashIntegrityHint,
    },
    smtp: {
      enabled: settings.smtpEnabled,
      host: settings.smtpHost ?? "",
      port: settings.smtpPort,
      user: settings.smtpUser ?? "",
      from: settings.smtpFrom ?? "",
      hasPassword: Boolean(settings.smtpPassEncrypted),
      passwordHint: settings.smtpPassHint,
    },
  };
}

export function configuredGateways(settings: PlatformSettings): Array<"stripe" | "paypak" | "jazzcash"> {
  const ready: Array<"stripe" | "paypak" | "jazzcash"> = [];
  if (settings.stripeEnabled && settings.stripeSecretEncrypted) ready.push("stripe");
  if (settings.paypakEnabled && settings.paypakSecretEncrypted && settings.paypakMerchantId) {
    ready.push("paypak");
  }
  if (settings.jazzcashEnabled && settings.jazzcashPasswordEncrypted && settings.jazzcashMerchantId) {
    ready.push("jazzcash");
  }
  return ready;
}

export function encryptIfPresent(value: string | undefined): { encrypted?: string; hint?: string } {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return {};
  return { encrypted: encryptString(trimmed), hint: secretHint(trimmed) };
}
