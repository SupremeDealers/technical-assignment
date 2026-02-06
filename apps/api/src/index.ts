import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import authRoutes from "./routes/auth";
import taskRoutes from './routes/task';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

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

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

export default app;
