import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    // Tests live in tests/, mirroring the source tree, and import code via the "@/" alias.
    include: ["tests/**/*.test.ts"],
  },
});
