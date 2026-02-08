import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import authRoutes from "./routes/auth.routes";
import boardRoutes from "./routes/boards.routes";
import columnRoutes from "./routes/columns.routes";
import taskRoutes from "./routes/tasks.route";
import commentRoutes from "./routes/comments.routes";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use("/", taskRoutes);
app.use("/", commentRoutes);

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
