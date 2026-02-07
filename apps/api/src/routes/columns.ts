import { Router } from "express";
import { db } from "../db";
import { columns } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { updateColumnSchema } from "../validation/schemas";
import { sendError } from "../errors";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authMiddleware);

router.patch("/:columnId", async (req, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    const validatedData = updateColumnSchema.parse(req.body);

    const column = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
    });

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const [updated] = await db
      .update(columns)
      .set(validatedData)
      .where(eq(columns.id, columnId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: error.errors,
      });
    }
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

router.delete("/:columnId", async (req, res) => {
  try {
    const columnId = parseInt(req.params.columnId);

    const column = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
    });

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    await db.delete(columns).where(eq(columns.id, columnId));

    res.status(204).send();
  } catch {
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

export default router;
