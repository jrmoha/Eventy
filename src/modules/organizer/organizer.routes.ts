import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { blocking } from "../../interfaces/middleware/privacy/blocking.middleware";
import { events, profile } from "./organizer.controller";

const router = Router();

router.get(
  "/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  profile,
);
router.get("/events/:id", authenticate(true, "u", "o"), events);

export default router;
