import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest corre en Node (sin navegador): prueba lógica pura y mocks de Prisma.
 * Alias `@/` alineado con `jsconfig.json` para importar igual que en Next.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    clearMocks: true,
  },
});
