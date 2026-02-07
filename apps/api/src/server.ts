import app from "./index";
import { initDb } from "./db/db";

// Initialize database
initDb();

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
