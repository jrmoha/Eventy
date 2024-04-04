import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import {
  delete_community,
  delete_member,
  get_communities,
  get_messages,
  join,
  leave,
  make_admin,
  remove_admin,
  send_message,
} from "./community.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import {
  communityMemberSchema,
  communityMessageSchema,
  deleteCommunitySchema,
} from "./community.validator";

const router = Router();

router.get("/all", authenticate(false, "u", "o"), get_communities);
router.post("/join/:id", authenticate(false, "u", "o"), join);
router.delete("/leave/:id", authenticate(false, "u", "o"), leave);
router.post(
  "/send-message/:id",
  authenticate(false, "u", "o"),
  validate(communityMessageSchema),
  send_message,
);

router.patch(
  "/make-admin/:id",
  authenticate(false, "o"),
  validate(communityMemberSchema),
  make_admin,
);
// remove_admin
router.delete(
  "/delete-admin/:id",
  authenticate(false, "o"),
  validate(communityMemberSchema),
  remove_admin,
);
// delete_community
router.delete(
  "/delete-community/:id",
  authenticate(false, "o"),
  validate(deleteCommunitySchema),
  delete_community,
);
// delete_member
router.delete(
  "/delete-member/:id",
  authenticate(false, "o"),
  validate(communityMemberSchema),
  delete_member,
);
//messages of a community
router.get(
  "/messages/:community_id",
  authenticate(false, "u", "o"),
  get_messages,
);

export default router;
