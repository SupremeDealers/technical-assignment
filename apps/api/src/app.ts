import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sendError } from "./errors";
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/boards";
import columnRoutes from "./routes/columns";
import taskRoutes from "./routes/tasks";
import commentRoutes from "./routes/comments";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use(taskRoutes);
app.use(commentRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  sendError(res, 500, {
    code: "INTERNAL",
    message: "Unexpected error",
  });
});

app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

export default app;
