import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./errors";
import protectedRoutes from "./routes/protected";
import boardRoutes from "./modules/boards/boards.routes";
import { columnsRouter } from "./modules/columns/columns.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import { commentsRouter } from "./modules/comments/comments.routes";


export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use("/protected", protectedRoutes);

app.use("/boards", boardRoutes);
app.use("/boards/:boardId/columns", columnsRouter);
app.use("/columns/:columnId/tasks", tasksRouter);
app.use("/tasks/:taskId/comments", commentsRouter);

app.use("/auth", authRouter);
app.use(errorHandler);


export default app;
