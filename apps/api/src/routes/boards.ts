import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/requireAuth";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/boards", requireAuth, async (req: AuthRequest, res) => {
  const boards = await prisma.board.findMany({
    where: {
      ownerId: req.user!.id,
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
      },
    },
  });

  res.json({ data: boards });
});

export default router;
