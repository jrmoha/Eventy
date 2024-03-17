import { Router } from "express";
import followRoutes from "../follow/follow.routes";
import friendRequestRoutes from "../friendrequest/friendrequest.routes";
import friendshipRoutes from "../friendship/friendship.routes";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import multer from "../../utils/multer";
import { get, interest, likes, update, uploadImage } from "./user.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { updateUserSchema, uploadImageSchema } from "./user.validator";
import inboxRoutes from "../inbox/inbox.routes";
import organizerRoutes from "../organizer/organizer.routes";
import { blocking } from "../../interfaces/middleware/privacy/blocking.middleware";
import communityRoutes from "../community/community.routes";
import settingRoute from "../settings/settings.routes";

const router = Router();
router.use("/o", organizerRoutes);
router.use(followRoutes);
router.use(inboxRoutes);
router.use("/community", communityRoutes);
router.use("/friend/request", friendRequestRoutes);
router.use("/friendship", friendshipRoutes);
router.use("/settings", settingRoute);

router.post(
  "/upload/image",
  authenticate(false, "u", "o"),
  multer("image", "images").single("image"),
  validate(uploadImageSchema),
  uploadImage,
);
router.patch(
  "/update",
  authenticate(false, "u", "o"),
  validate(updateUserSchema),
  update,
);

router.get("/u/:username", authenticate(true, "u", "o"), get);
router.get(
  "/u/likes/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  likes,
);
router.get(
  "/u/interests/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  interest,
);
export default router;
