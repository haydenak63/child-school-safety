// Standalone check that the Prisma query engine can load and run on this host.
// Deliberately plain .mjs so it runs on bare `node` without tsx or any bundler.
import { PrismaClient } from "@prisma/client";
import { loadDotEnv } from "./load-env.mjs";

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
