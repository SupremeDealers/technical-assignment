import { drizzle } from "drizzle-orm/sql-js";
import { Database } from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as schema from "./schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "../../data.db");

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
