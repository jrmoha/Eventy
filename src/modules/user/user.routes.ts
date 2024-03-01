import { Router } from "express";
import followRoutes from "../follow/follow.routes";
import friendRequestRoutes from "../friendrequest/friendrequest.routes";
import friendshipRoutes from "../friendship/friendship.routes";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import multer from "../../utils/multer";
import { get, update, uploadImage } from "./user.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { updateUserSchema, uploadImageSchema } from "./user.validator";

const router = Router();
router.use(followRoutes);
router.use("/friend/request", friendRequestRoutes);
router.use("/friendship", friendshipRoutes);

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
router.get("/:username", authenticate(true, "u", "o"), get);

export default router;
