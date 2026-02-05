import { Router } from "express";
import { authMiddleware } from "../auth/middleware";
import * as columnsController from "../controllers/columns.controller";

const router = Router();
router.use(authMiddleware);

router.patch("/:columnId", columnsController.patchColumn);
router.delete("/:columnId", columnsController.deleteColumn);

export default router;
