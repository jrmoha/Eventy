import { Router } from "express";
import followRoutes from "../follow/follow.routes";
import friendRequestRoutes from "../friendrequest/friendrequest.routes";
import friendshipRoutes from "../friendship/friendship.routes";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import multer from "../../utils/multer";
import * as UC from "./user.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import * as US from "./user.validator";
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
  validate(US.uploadImageSchema),
  UC.uploadImage,
);
router.delete("/delete/image", authenticate(false, "u", "o"), UC.deleteImage);
router.patch(
  "/update",
  authenticate(false, "u", "o"),
  validate(US.updateUserSchema),
  UC.update,
);
router.patch(
  "/update/email",
  authenticate(false, "u", "o"),
  validate(US.updateEmailSchema),
  UC.change_email,
);
router.patch(
  "/update/password",
  authenticate(false, "u", "o"),
  validate(US.changePasswordSchema),
  UC.change_password,
);

router.get("/basic_info", authenticate(false, "u", "o"), UC.basic_info);

router.get(
  "/u/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  UC.profile,
);

router.get(
  "/u/likes/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  UC.likes,
);
router.get(
  "/u/interests/:username",
  authenticate(true, "u", "o"),
  blocking(":username"),
  UC.interest,
);
export default router;
