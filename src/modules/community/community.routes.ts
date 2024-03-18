import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import {
  get_communities,
  join,
  leave,
  send_message,
} from "./community.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { sendMessageInCommunitySchema } from "./community.validator";

const router = Router();

router.get("/all", authenticate(false, "u", "o"), get_communities);
router.post("/join/:id", authenticate(false, "u", "o"), join);
router.delete("/leave/:id", authenticate(false, "u", "o"), leave);
router.post(
  "/send-message/:id",
  authenticate(false, "u", "o"),
  validate(sendMessageInCommunitySchema),
  send_message,
);
export default router;
