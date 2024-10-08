import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { blocking } from "../../interfaces/middleware/privacy/blocking.middleware";
import * as OC from "./organizer.controller";
import * as UC from "../user/user.controller";
import { cache } from "../../interfaces/middleware/cache.middleware";

const router = Router();

router.get(
  "/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  cache("organizer"),
  OC.profile,
);

router.get(
  "/events/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  OC.events,
);

router.get(
  "/likes/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  UC.likes,
);
router.get(
  "/interests/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  UC.interest,
);

export default router;
