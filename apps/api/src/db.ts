import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//detect working environment
const isTest = process.env.NODE_ENV === "test";


const DB_FILE = isTest ? "test.db" : "dev.db";

const DB_DIR = path.join(__dirname, "../data");


if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, DB_FILE);

//create DB
const db = new Database(DB_PATH);

//enable FK
db.exec(`PRAGMA foreign_keys = ON;`);

//initialize DB
export function initDb() {
  const schemaPath = path.join(__dirname, "schema.sql");

  if (!fs.existsSync(schemaPath)) {
    throw new Error("schema.sql not found");
  }

  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

export default db;
