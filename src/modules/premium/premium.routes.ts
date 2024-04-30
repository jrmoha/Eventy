import express, { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import * as PremiumController from "./premium.controller";

const router = Router();

router.post(
  "/become-premium",
  authenticate(false, "u", "o"),
  PremiumController.becomePremium,
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PremiumController.webhook,
);

export default router;
