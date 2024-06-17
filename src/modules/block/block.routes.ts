import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import * as BlockController from "./block.controller";

const router = Router();

router.post("/block/:id", authenticate(false, "u", "o"), BlockController.block);
router.delete(
  "/unblock/:id",
  authenticate(false, "u", "o"),
  BlockController.unblock,
);

export default router;
