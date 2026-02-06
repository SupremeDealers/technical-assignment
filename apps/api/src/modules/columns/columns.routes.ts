import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getColumns,
  postColumn,
  patchColumn,
  deleteColumnHandler,
} from "./columns.controller";

export const columnsRouter = Router({ mergeParams: true });

columnsRouter.get("/", requireAuth, getColumns);
columnsRouter.post("/", requireAuth, postColumn);
columnsRouter.patch("/:columnId", requireAuth, patchColumn);
columnsRouter.delete("/:columnId", requireAuth, deleteColumnHandler);
