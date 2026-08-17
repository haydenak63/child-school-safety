-- CreateEnum
CREATE TYPE "BillingPlan" AS ENUM ('STARTER', 'GROWTH', 'CAMPUS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "GatewayMode" AS ENUM ('TEST', 'LIVE');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "platformOperator" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SchoolSubscription" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "plan" "BillingPlan" NOT NULL DEFAULT 'STARTER',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "assignedManually" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "billingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeMode" "GatewayMode" NOT NULL DEFAULT 'TEST',
    "stripePublishableKey" TEXT,
    "stripeSecretEncrypted" TEXT,
    "stripeSecretHint" TEXT,
    "stripeWebhookSecretEncrypted" TEXT,
    "stripeWebhookHint" TEXT,
    "paypakEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paypakMerchantId" TEXT,
    "paypakApiUrl" TEXT,
    "paypakSecretEncrypted" TEXT,
    "paypakSecretHint" TEXT,
    "jazzcashEnabled" BOOLEAN NOT NULL DEFAULT false,
    "jazzcashMerchantId" TEXT,
    "jazzcashPasswordEncrypted" TEXT,
    "jazzcashPasswordHint" TEXT,
    "jazzcashIntegrityEncrypted" TEXT,
    "jazzcashIntegrityHint" TEXT,
    "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUser" TEXT,
    "smtpFrom" TEXT,
    "smtpPassEncrypted" TEXT,
    "smtpPassHint" TEXT,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSubscription_schoolId_key" ON "SchoolSubscription"("schoolId");

-- AddForeignKey
ALTER TABLE "SchoolSubscription" ADD CONSTRAINT "SchoolSubscription_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
