import { hashToken } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { TerminalKiosk } from "@/components/terminal-kiosk";
import { DemoBanner } from "@/components/demo-banner";
import { isDemoMode } from "@/lib/env";

export default async function TerminalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const terminal = await prisma.terminal.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!terminal || terminal.status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-ink text-white">
        <DemoBanner />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Terminal unauthorized</h1>
          <p className="mt-3 text-white/70">
            This terminal URL is invalid or has been revoked. Ask an admin to generate a new QR code.
          </p>
        </div>
      </div>
    );
  }

  return <TerminalKiosk token={token} terminalName={terminal.name} demo={isDemoMode()} />;
}
