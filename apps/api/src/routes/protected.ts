import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({
    userId: req.user?.id,
  });
});

export default router;
