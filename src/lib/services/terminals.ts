import { AppError } from "@/lib/errors";
import { createSecureToken, decryptString, encryptString, hashToken } from "@/lib/crypto";
import { getAppUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { qrDataUrl } from "@/lib/qr";

export async function requireTerminal(token: string) {
  const terminal = await prisma.terminal.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { school: true },
  });
  if (!terminal || terminal.status !== "ACTIVE") {
    throw new AppError(
      "TERMINAL_UNAUTHORIZED",
      "This terminal is unauthorized or has been revoked.",
      401,
    );
  }
  return terminal;
}

export async function createTerminalRecord(options: {
  schoolId: string;
  name: string;
  location: string;
}) {
  const token = createSecureToken();
  const terminal = await prisma.terminal.create({
    data: {
      schoolId: options.schoolId,
      name: options.name,
      location: options.location,
      tokenHash: hashToken(token),
      tokenEncrypted: encryptString(token),
    },
  });
  const url = `${getAppUrl()}/terminal/${token}`;
  return {
    terminal,
    token,
    url,
    qrDataUrl: await qrDataUrl(url),
  };
}

export async function terminalPublicView(
  terminal: {
    id: string;
    name: string;
    location: string;
    status: string;
    lastActivityAt: Date | null;
    createdAt: Date;
    tokenEncrypted: string;
  },
  appUrl = getAppUrl(),
) {
  const token = decryptString(terminal.tokenEncrypted);
  const url = `${appUrl.replace(/\/$/, "")}/terminal/${token}`;
  return {
    id: terminal.id,
    name: terminal.name,
    location: terminal.location,
    status: terminal.status,
    lastActivityAt: terminal.lastActivityAt,
    createdAt: terminal.createdAt,
    url: terminal.status === "ACTIVE" ? url : null,
    qrDataUrl: terminal.status === "ACTIVE" ? await qrDataUrl(url) : null,
  };
}
