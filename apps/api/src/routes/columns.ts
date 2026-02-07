import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { parseOrError } from "../validate";
import { sendError } from "../errors";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { findColumn } from "../queries";

const router = Router();

const patchSchema = z
  .object({
    title: z.string().min(1).optional(),
    order: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field",
  });

router.patch("/:columnId", requireAuth, async (req, res) => {
  const body = parseOrError(res, patchSchema, req.body);
  if (!body) return;
  const { columnId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const column = await findColumn(prisma, columnId, userId);
  if (!column) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Column not found",
    });
  }

  const updated = await prisma.column.update({
    where: { id: columnId },
    data: body,
  });
  return res.json(updated);
});

router.delete("/:columnId", requireAuth, async (req, res) => {
  const { columnId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const column = await findColumn(prisma, columnId, userId);
  if (!column) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Column not found",
    });
  }
  await prisma.column.delete({ where: { id: columnId } });
  return res.json({ ok: true });
});

export default router;
