// Standalone check that the Prisma query engine can load and run on this host.
// Deliberately plain .mjs so it runs on bare `node` without tsx or any bundler.
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

function loadDotEnv(file = ".env") {
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const key = line.slice(0, i).trim();
      const value = line
        .slice(i + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env is optional when the environment is already populated
  }
}

loadDotEnv();

console.log("node:", process.version);
console.log("platform:", process.platform, process.arch);
console.log("DATABASE_URL set:", Boolean(process.env.DATABASE_URL));

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("query engine: OK");

  const [schools, admins, students, terminals] = await Promise.all([
    prisma.school.count(),
    prisma.admin.count(),
    prisma.student.count(),
    prisma.terminal.count(),
  ]);
  console.log("counts:", { schools, admins, students, terminals });
  console.log("RESULT: PASS");
} catch (error) {
  console.error("RESULT: FAIL");
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
