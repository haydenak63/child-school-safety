import os from "os";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { terminalPublicView } from "@/lib/services/terminals";
import { CreateTerminalForm } from "@/components/create-terminal-form";
import { TerminalCard } from "@/components/terminals/terminal-card";
import { formatTime } from "@/lib/dates";
import { firstHeaderValue, getAppUrl } from "@/lib/env";
import { Card, PageHeader } from "@/components/ui/primitives";

function lanUrls(port: string): string[] {
  const urls: string[] = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        urls.push(`https://${addr.address}:3443`);
      }
    }
  }
  return urls;
}

export default async function TerminalsPage() {
  const session = await requireAdminPage();
  const headerStore = await headers();
  const host =
    firstHeaderValue(headerStore.get("x-forwarded-host")) ||
    firstHeaderValue(headerStore.get("host")) ||
    "localhost:3000";
  const proto = firstHeaderValue(headerStore.get("x-forwarded-proto")) || "https";
  const origin = `${proto}://${host}`;
  const port = host.split(":")[1] || "3000";
  const phoneUrls = lanUrls(port);
  const school = await prisma.school.findUniqueOrThrow({ where: { id: session.schoolId } });
  const terminals = await prisma.terminal.findMany({
    where: { schoolId: session.schoolId },
    orderBy: { createdAt: "asc" },
  });
  const views = await Promise.all(terminals.map((terminal) => terminalPublicView(terminal, origin)));
  const isLocalhost = host.includes("localhost") || host.startsWith("127.");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Terminals"
        description="Each terminal is a physical gate device with its own URL and QR code."
      />
      {isLocalhost ? (
        <Card className="border-warn/20 bg-warn-soft p-5 text-sm text-warn">
          <p className="font-semibold">Phone scan: do not use these localhost QR codes.</p>
          <p className="mt-2">
            Open this admin page from the HTTPS Wi-Fi address, accept the certificate warning, then
            scan the QR codes shown there:
          </p>
          <ul className="mt-3 space-y-1">
            {phoneUrls.length > 0 ? (
              phoneUrls.map((url) => (
                <li key={url}>
                  <a href={`${url}/terminals`} className="font-medium underline">
                    {url}/terminals
                  </a>
                </li>
              ))
            ) : (
              <li>Use the Network URL printed by `npm run dev`.</li>
            )}
          </ul>
          <p className="mt-3">
            To test the camera on this PC, open a terminal below. Default app URL is {getAppUrl()}.
          </p>
        </Card>
      ) : (
        <Card className="border-ok/20 bg-ok-soft p-5 text-sm text-ok">
          QR codes now point at <span className="font-medium">{origin}</span>. Scan them with a phone
          on the same Wi-Fi network.
        </Card>
      )}
      <CreateTerminalForm />
      <div className="grid gap-5 md:grid-cols-2">
        {views.map((terminal) => (
          <TerminalCard
            key={terminal.id}
            terminal={{
              ...terminal,
              lastActivityLabel: terminal.lastActivityAt
                ? formatTime(terminal.lastActivityAt, school.timezone)
                : "No scans yet",
            }}
          />
        ))}
      </div>
    </div>
  );
}
