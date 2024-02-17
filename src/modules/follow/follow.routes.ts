import { Router } from "express";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { followSchema } from "./follow.validator";
import { follow, unfollow } from "./follow.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";

const router = Router();

router.post(
  "/follow/:id",
  authenticate("u", "o"),
  validate(followSchema),
  follow,
);
router.delete(
  "/unfollow/:id",
  authenticate("u", "o"),
  validate(followSchema),
  unfollow,
);

export default router;
