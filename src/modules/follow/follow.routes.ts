import { Router } from "express";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { followSchema } from "./follow.validator";
import * as FC from "./follow.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";

const router = Router();

router.post(
  "/follow/:id",
  authenticate("u", "o"),
  validate(followSchema),
  FC.follow,
);
router.delete(
  "/unfollow/:id",
  authenticate("u", "o"),
  validate(followSchema),
  FC.unfollow,
);

router.get("/followers/:username", FC.followers);
router.get("/followings/:username", FC.followings);

export default router;
