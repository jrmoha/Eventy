import { authenticate } from "./../../interfaces/middleware/authentication.middleware";
import { Router } from "express";
import { unfriend } from "./friendship.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { unfriendSchema } from "./friendship.validator";

const router = Router();

router.delete(
  "/unfriend/:id",
  authenticate(false,"u", "o"),
  validate(unfriendSchema),
  unfriend,
);

export default router;
