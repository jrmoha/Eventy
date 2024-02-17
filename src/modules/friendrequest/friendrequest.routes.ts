import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { friendRequestSchema } from "./friendrequest.validator";
import { accept, cancel, send } from "./friendrequest.controller";

const router = Router();

//send
router.post(
  "/send/:id",
  authenticate("o", "u"),
  validate(friendRequestSchema),
  send,
);

//accept
router.patch(
  "/accept/:id",
  authenticate("o", "u"),
  validate(friendRequestSchema),
  accept,
);

//cancel
router.delete(
  "/cancel/:id",
  authenticate("o", "u"),
  validate(friendRequestSchema),
  cancel,
);

export default router;
