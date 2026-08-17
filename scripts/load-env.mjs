import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env reader so standalone scripts can run under bare `node`, without
// pulling in a loader such as tsx. Existing environment variables win, which
// keeps cPanel's own variable panel authoritative over the file.
export function loadDotEnv(file = ".env") {
  let contents;
  try {
    contents = readFileSync(join(repoRoot, file), "utf8");
  } catch {
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    const value = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}
