import { getLikesSchema, likeSchema, unlikeSchema } from "./like.validator";
import { validate } from "./../../interfaces/middleware/validator.middleware";
import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { get_likes, like, unlike } from "./like.controller";

const router = Router({ mergeParams: true });

router.post("/like", authenticate(false, "u", "o"), validate(likeSchema), like);
router.delete(
  "/unlike",
  authenticate(false, "u", "o"),
  validate(unlikeSchema),
  unlike,
);
router.get(
  "/likes",
  authenticate(false, "u", "o"),
  validate(getLikesSchema),
  get_likes,
);

export default router;
