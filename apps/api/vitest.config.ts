import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
    // Run one test file at a time so afterEach clearAllData() doesn't wipe DB during another file's test
    fileParallelism: false,
  },
});
