import { Router } from "express";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { followSchema } from "./follow.validator";
import * as FC from "./follow.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { blocking } from "../../interfaces/middleware/privacy/blocking.middleware";

const router = Router();

router.post(
  "/follow/:id",
  authenticate(false, "u", "o"),
  blocking(":id"),
  validate(followSchema),
  FC.follow,
);
router.delete(
  "/unfollow/:id",
  authenticate(false, "u", "o"),
  validate(followSchema),
  FC.unfollow,
);

router.get(
  "/followers/:username",
  authenticate(true),
  blocking(":username"),
  FC.followers,
);
router.get(
  "/followings/:username",
  authenticate(true),
  blocking(":username"),
  FC.followings,
);

export default router;
