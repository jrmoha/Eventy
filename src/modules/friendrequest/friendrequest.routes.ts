import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { friendRequestSchema } from "./friendrequest.validator";
import { accept, cancel, send ,get_all} from "./friendrequest.controller";

const router = Router();

//get all friend requests
router.get("/all", authenticate(false, "o", "u"), get_all);

//send
router.post(
  "/send/:id",
  authenticate(false, "o", "u"),
  validate(friendRequestSchema),
  send,
);

//accept
router.patch(
  "/accept/:id",
  authenticate(false, "o", "u"),
  validate(friendRequestSchema),
  accept,
);

//cancel
router.delete(
  "/cancel/:id",
  authenticate(false, "o", "u"),
  validate(friendRequestSchema),
  cancel,
);

export default router;
