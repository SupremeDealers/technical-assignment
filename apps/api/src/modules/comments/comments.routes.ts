import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getCommentsHandler, postCommentHandler } from "./comments.controller";

export const commentsRouter = Router({ mergeParams: true });

commentsRouter.get("/", requireAuth, getCommentsHandler);
commentsRouter.post("/", requireAuth, postCommentHandler);
