import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import * as analyticsController from "./analytics.controller";

const router = Router();

router.get("/overview", authenticate(false, "o"), analyticsController.overview);
router.get(
  "/search",
  authenticate(false, "o"),
  analyticsController.searchPosts,
);
router.get(
  "/:event_id",
  authenticate(false, "o"),
  analyticsController.eventAnalytics,
);

export default router;
