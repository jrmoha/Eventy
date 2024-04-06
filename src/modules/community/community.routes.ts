import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import * as CommunityController from "./community.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import {
  communityMemberSchema,
  communityMessageSchema,
  deleteCommunitySchema,
} from "./community.validator";

const router = Router();

router.get(
  "/all",
  authenticate(false, "u", "o"),
  CommunityController.get_communities,
);
router.get(
  "/members/:id",
  authenticate(false, "u", "o"),
  CommunityController.community_members,
);
router.post(
  "/join/:id",
  authenticate(false, "u", "o"),
  CommunityController.join,
);
router.delete(
  "/leave/:id",
  authenticate(false, "u", "o"),
  CommunityController.leave,
);
router.post(
  "/send-message/:id",
  authenticate(false, "u", "o"),
  validate(communityMessageSchema),
  CommunityController.send_message,
);

router.patch(
  "/make-admin/:id",
  authenticate(false, "o"),
  validate(communityMemberSchema),
  CommunityController.make_admin,
);
// remove_admin
router.delete(
  "/delete-admin/:id",
  authenticate(false, "o"),
  validate(communityMemberSchema),
  CommunityController.remove_admin,
);
// delete_community
router.delete(
  "/delete-community/:id",
  authenticate(false, "o"),
  validate(deleteCommunitySchema),
  CommunityController.delete_community,
);
// delete_member
router.delete(
  "/delete-member/:id",
  authenticate(false, "o"),
  validate(communityMemberSchema),
  CommunityController.delete_member,
);
//messages of a community
router.get(
  "/messages/:community_id",
  authenticate(false, "u", "o"),
  CommunityController.get_messages,
);

export default router;
