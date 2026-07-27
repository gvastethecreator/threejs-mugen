import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Full suite under Windows + fork workers can exceed 5s defaults on heavy fixtures.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
