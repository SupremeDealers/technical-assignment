import { db } from "./db/index";
import { columns } from "./db/schema";

async function checkDb() {
  const allColumns = await db.select().from(columns);
  console.log("Columns in database:", JSON.stringify(allColumns, null, 2));
}

checkDb().catch(console.error);
