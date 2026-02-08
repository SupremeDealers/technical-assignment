import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/requireAuth";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/columns", requireAuth, async (req: AuthRequest, res) => {
  const columns = await prisma.column.findMany();
  
  res.json(columns);
});

export default router;
