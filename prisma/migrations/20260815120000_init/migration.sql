-- CreateSchema
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "TerminalStatus" AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE "AttendanceEventType" AS ENUM ('ARRIVAL', 'DEPARTURE');
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'MOCKED');

CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "scanCooldownSeconds" INTEGER NOT NULL DEFAULT 10,
    "matchThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.58,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photo" TEXT,
    "className" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentParent" (
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "StudentParent_pkey" PRIMARY KEY ("studentId","parentId")
);

CREATE TABLE "FingerprintTemplate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "templateData" TEXT NOT NULL,
    "finger" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FingerprintTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Terminal" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenEncrypted" TEXT NOT NULL,
    "status" "TerminalStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Terminal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceEvent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "terminalId" TEXT NOT NULL,
    "eventType" "AttendanceEventType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attendanceEventId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'WHATSAPP',
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnrollmentSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnrollmentSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Student_schoolId_studentNumber_key" ON "Student"("schoolId", "studentNumber");
CREATE UNIQUE INDEX "Terminal_tokenHash_key" ON "Terminal"("tokenHash");
CREATE UNIQUE INDEX "EnrollmentSession_tokenHash_key" ON "EnrollmentSession"("tokenHash");
CREATE INDEX "AttendanceEvent_studentId_timestamp_idx" ON "AttendanceEvent"("studentId", "timestamp");
CREATE INDEX "AttendanceEvent_timestamp_idx" ON "AttendanceEvent"("timestamp");

ALTER TABLE "Admin" ADD CONSTRAINT "Admin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentParent" ADD CONSTRAINT "StudentParent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentParent" ADD CONSTRAINT "StudentParent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FingerprintTemplate" ADD CONSTRAINT "FingerprintTemplate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Terminal" ADD CONSTRAINT "Terminal_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceEvent" ADD CONSTRAINT "AttendanceEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceEvent" ADD CONSTRAINT "AttendanceEvent_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_attendanceEventId_fkey" FOREIGN KEY ("attendanceEventId") REFERENCES "AttendanceEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnrollmentSession" ADD CONSTRAINT "EnrollmentSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
