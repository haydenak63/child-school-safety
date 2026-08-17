import os from "os";
import path from "path";
import type { NextConfig } from "next";

function lanDevOrigins(): string[] {
  const hosts = new Set<string>(["127.0.0.1", "localhost"]);
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      const family = String(addr.family);
      if ((family === "IPv4" || family === "4") && !addr.internal) {
        hosts.add(addr.address);
      }
    }
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: lanDevOrigins(),
  serverExternalPackages: ["sharp", "@prisma/client", "prisma"],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
