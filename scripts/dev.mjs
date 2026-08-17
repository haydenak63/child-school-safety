import { createServer } from "node:http";
import { spawn } from "node:child_process";

const HTTPS_PORT = 3443;
const HTTP_PORT = 3000;

const next = spawn(
  "npx",
  ["next", "dev", "--experimental-https", "-p", String(HTTPS_PORT)],
  { stdio: "inherit", shell: true, cwd: process.cwd() },
);

const redirector = createServer((req, res) => {
  const host = (req.headers.host || "localhost").split(":")[0];
  const location = `https://${host}:${HTTPS_PORT}${req.url || "/"}`;
  res.writeHead(302, { Location: location });
  res.end();
});

redirector.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`HTTP ${HTTP_PORT} redirects to HTTPS ${HTTPS_PORT}`);
});

function shutdown() {
  next.kill();
  redirector.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
next.on("exit", (code) => {
  redirector.close();
  process.exit(code ?? 0);
});
