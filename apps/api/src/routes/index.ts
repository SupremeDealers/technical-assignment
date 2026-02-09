import { Router } from "express";
import { userRouter } from "./userRouter";
import { boardRouter } from "./boardRouter";
import { columnRouter } from "./columnRouter";
import { taskRouter } from "./taskRouter";
import { commentRouter } from "./commentRouter";

export const mainRouter = Router();


mainRouter.use("/auth", userRouter);
mainRouter.use("/boards", boardRouter);
mainRouter.use("/columns", columnRouter);
mainRouter.use("/tasks", taskRouter);
mainRouter.use("/comments", commentRouter);