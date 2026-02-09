import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import { configDotenv } from "dotenv";
import { prisma } from "./utilities/db";
import types from "../types"
import { mainRouter } from "./routes";
configDotenv();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use(mainRouter);
/**
 * Example: how we want errors shaped.
 * Candidates should re-use this for their implementation.
 */
app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

const port = Number(process.env.PORT || 4000);

async function main() {
  try {
    app.listen(port, () => {
      console.log(`[api] listening on http://localhost:${port}`);
    });
  } catch (e) {
    console.error('failed to start the server', e)
  }

}
main();

export default app;
