import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store DB in the root of the project for persistence across restarts
const dbPath = path.resolve(__dirname, "../../../../takehome.db");
const db = new Database(dbPath);

// Initialize schema
try {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  console.log("Database initialized");
} catch (err) {
  console.error("Failed to initialize database:", err);
}

export default db;
