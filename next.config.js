// Kept as CommonJS .js rather than .ts on purpose: Next.js transpiles a .ts
// config through the native next-swc binary, which cannot load on glibc < 2.31
// (the deployment target runs CloudLinux 8 / glibc 2.28). A .js config is read
// with a plain dynamic import, so the production server never needs SWC.
const os = require("os");

function lanDevOrigins() {
  const hosts = new Set(["127.0.0.1", "localhost"]);
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: lanDevOrigins(),
  serverExternalPackages: ["sharp", "@prisma/client", "prisma"],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
