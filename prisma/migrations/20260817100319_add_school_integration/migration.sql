-- CreateEnum
CREATE TYPE "IntegrationTestStatus" AS ENUM ('OK', 'AUTH_FAILED', 'REMOTE_DISABLED', 'INVALID_PAYLOAD', 'RATE_LIMITED', 'SERVER_ERROR', 'UNREACHABLE', 'UNEXPECTED');

-- CreateTable
CREATE TABLE "SchoolIntegration" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "baseUrl" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "apiKeyHint" TEXT NOT NULL,
    "secretEncrypted" TEXT NOT NULL,
    "secretHint" TEXT NOT NULL,
    "lastTestedAt" TIMESTAMP(3),
    "lastStatus" "IntegrationTestStatus",
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolIntegration_schoolId_key" ON "SchoolIntegration"("schoolId");

-- AddForeignKey
ALTER TABLE "SchoolIntegration" ADD CONSTRAINT "SchoolIntegration_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
