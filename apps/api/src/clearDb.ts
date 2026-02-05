/**
 * Clear database: removes the SQLite file so it can be recreated on next run.
 * Run with: pnpm run clear-db
 */
import fs from "fs";
import path from "path";

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "boards.db");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Database cleared:", dbPath);
} else {
  console.log("No database file found at", dbPath);
}
