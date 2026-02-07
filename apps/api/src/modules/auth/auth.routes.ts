import { Router } from "express";
import * as authController from "./auth.controller";
const router = Router();

router.post("/register", authController.registerHandler);
router.post("/login", authController.loginHandler);

//! * Optional Future Routes

// router.post("/refresh", authController.refreshTokenHandler);
// router.post("/logout", authController.logoutHandler);

export { router as authRouter };
export default router;
