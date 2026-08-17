import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Separate PHP project, not part of this app's source.
    "iqpigeon/**",
    // CommonJS entry points: next.config.js is deliberately not TypeScript so
    // the production server never loads next-swc, and server.js is cPanel's
    // Passenger startup file.
    "next.config.js",
    "server.js",
  ]),
]);

export default eslintConfig;
