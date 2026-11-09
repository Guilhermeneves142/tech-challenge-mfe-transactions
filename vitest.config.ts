import path from "node:path";
import { defineConfig } from "vitest/config";

// Testes unitários de domain / application / store (Node puro, sem browser).
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
