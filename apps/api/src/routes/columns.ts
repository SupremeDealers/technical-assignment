import { Router, Request, Response } from "express";
import db from "../db.js";
import { authMiddleware } from "../auth.js";
import { validate } from "../middleware.js";
import { updateColumnSchema } from "../schemas.js";
import { sendError } from "../errors.js";

const router = Router();
router.use(authMiddleware);

// PATCH /columns/:columnId
router.patch("/:columnId", validate(updateColumnSchema), (req: Request, res: Response) => {
  const col = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.columnId) as any;
  if (!col) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
  }

  const { name, position } = req.body;
  if (name !== undefined) {
    db.prepare("UPDATE columns SET name = ? WHERE id = ?").run(name, col.id);
  }
  if (position !== undefined) {
    db.prepare("UPDATE columns SET position = ? WHERE id = ?").run(position, col.id);
  }

  const updated = db.prepare("SELECT * FROM columns WHERE id = ?").get(col.id);
  res.json({ column: updated });
});

// DELETE /columns/:columnId
router.delete("/:columnId", (req: Request, res: Response) => {
  const col = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.columnId) as any;
  if (!col) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
  }

  db.prepare("DELETE FROM columns WHERE id = ?").run(col.id);
  res.json({ ok: true });
});

export default router;
