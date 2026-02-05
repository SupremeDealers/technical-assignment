import { afterEach } from "vitest";
import { clearAllData } from "../src/db/index";

// Use in-memory DB for tests so we don't touch dev data
process.env.SQLITE_PATH = ":memory:";

// Clear all data after each test so the suite can run continuously (e.g. watch mode)
afterEach(() => {
  clearAllData();
});
