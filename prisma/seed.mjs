// Plain .mjs rather than .ts on purpose. Running the seed through tsx spawns an
// extra esbuild process, and on CloudLinux the per-account LVE process/thread
// cap then starves the Prisma query engine's timer thread, which crashes the
// engine with "PANIC: timer has gone away" on the first query.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { loadDotEnv } from "../scripts/load-env.mjs";

loadDotEnv();

const prisma = new PrismaClient();

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function encryptString(plaintext) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters.");
  }
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function token() {
  return randomBytes(32).toString("base64url");
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@abcschool.test").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed the admin account.");
  }

  await prisma.notificationLog.deleteMany();
  await prisma.attendanceEvent.deleteMany();
  await prisma.enrollmentSession.deleteMany();
  await prisma.fingerprintTemplate.deleteMany();
  await prisma.studentParent.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.school.deleteMany();

  const school = await prisma.school.create({
    data: {
      name: "ABC International School",
      address: "Plot 12, School Road, Karachi",
      timezone: "Asia/Karachi",
      scanCooldownSeconds: 10,
      matchThreshold: 0.58,
    },
  });

  await prisma.admin.create({
    data: {
      schoolId: school.id,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: "School Admin",
    },
  });

  const students = await prisma.student.createManyAndReturn({
    data: [
      {
        schoolId: school.id,
        studentNumber: "STU-001",
        firstName: "Ali",
        lastName: "Ahmed",
        className: "Grade 5",
        section: "B",
      },
      {
        schoolId: school.id,
        studentNumber: "STU-002",
        firstName: "Sara",
        lastName: "Khan",
        className: "Grade 4",
        section: "A",
      },
      {
        schoolId: school.id,
        studentNumber: "STU-003",
        firstName: "Hamza",
        lastName: "Malik",
        className: "Grade 6",
        section: "C",
      },
    ],
  });

  const parents = await prisma.parent.createManyAndReturn({
    data: [
      {
        schoolId: school.id,
        name: "Muhammad Ahmed",
        relationship: "Father",
        whatsappNumber: "+923001110001",
      },
      {
        schoolId: school.id,
        name: "Ayesha Khan",
        relationship: "Mother",
        whatsappNumber: "+923001110002",
      },
      {
        schoolId: school.id,
        name: "Imran Malik",
        relationship: "Father",
        whatsappNumber: "+923001110003",
      },
    ],
  });

  await prisma.studentParent.createMany({
    data: students.map((student, index) => ({
      studentId: student.id,
      parentId: parents[index].id,
      isPrimary: true,
    })),
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const terminals = [
    { name: "Main Entrance", location: "Front gate" },
    { name: "Main Exit", location: "Rear gate" },
  ];

  console.log("\nSeeded terminals:");
  for (const item of terminals) {
    const plain = token();
    await prisma.terminal.create({
      data: {
        schoolId: school.id,
        name: item.name,
        location: item.location,
        tokenHash: hashToken(plain),
        tokenEncrypted: encryptString(plain),
      },
    });
    console.log(`  ${item.name}: ${appUrl}/terminal/${plain}`);
  }

  console.log(`\nAdmin login: ${email}`);
  console.log("Students: Ali Ahmed, Sara Khan, Hamza Malik");
  console.log("Fingerprints are not seeded. Enroll them with a phone camera.\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
