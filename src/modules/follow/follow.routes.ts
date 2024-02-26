import { Router } from "express";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { followSchema } from "./follow.validator";
import * as FC from "./follow.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";

const router = Router();

router.post(
  "/follow/:id",
  authenticate(false, "u", "o"),
  validate(followSchema),
  FC.follow,
);
router.delete(
  "/unfollow/:id",
  authenticate(false, "u", "o"),
  validate(followSchema),
  FC.unfollow,
);

router.get("/followers/:username", authenticate(true), FC.followers);
router.get("/followings/:username", authenticate(true), FC.followings);

export default router;
