import express from "express";
import cors from "cors";
import { sendError } from "./errors";

import authRoutes from "./routes/auth";
import boardsRoutes from "./routes/boards";
import columnsRoutes from "./routes/columns";
import tasksRoutes from "./routes/tasks";
import commentsRoutes from "./routes/comments";
import featuresRoutes from "./routes/features";

import "./db";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/boards", boardsRoutes);
app.use("/columns", columnsRoutes);
app.use("/", tasksRoutes);
app.use("/", commentsRoutes);
app.use("/", featuresRoutes);

app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });
}

export default app;
