import { getDb } from "./db/index";

const db = getDb();

console.log("✓ Database initialized successfully!\n");

// List all tables
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all();

console.log("Tables created:");
tables.forEach((table: any) => {
  console.log(`  - ${table.name}`);
  
  // Get column info for each table
  const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
  columns.forEach((col: any) => {
    console.log(`    • ${col.name} (${col.type})`);
  });
  console.log("");
});

process.exit(0);
