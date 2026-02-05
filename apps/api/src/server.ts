import app from "./index";
import { getDbInstance } from "./db";
import { ensureDefaultBoard } from "./db/ensureDefaultBoard";

// Ensure default board (id 1) exists on server start
const db = getDbInstance();
ensureDefaultBoard(db);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
