import { authenticate } from "./../../interfaces/middleware/authentication.middleware";
import { Router } from "express";
import { get_friends, unfriend } from "./friendship.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { unfriendSchema } from "./friendship.validator";
import { blocking } from "../../interfaces/middleware/privacy/blocking.middleware";

const router = Router();

router.delete(
  "/unfriend/:id",
  authenticate(false, "u", "o"),
  validate(unfriendSchema),
  unfriend,
);
router.get(
  "/friends/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  get_friends,
);

export default router;
