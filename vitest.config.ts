import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: path.resolve(__dirname, "__tests__/setup.ts"),
    // include: [
    //   '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    //   '**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    // ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
