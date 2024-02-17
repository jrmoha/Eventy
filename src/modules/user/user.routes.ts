import { Router } from "express";
import followRoutes from "../follow/follow.routes";
import friendRequestRoutes from "../friendrequest/friendrequest.routes";
import friendshipRoutes from "../friendship/friendship.routes";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import multer from "../../utils/multer";
import { uploadImage } from "./user.controller";

const router = Router();
router.use(followRoutes);
router.use("/friend/request", friendRequestRoutes);
router.use("/friendship", friendshipRoutes);

router.post(
  "/upload/image",
  authenticate("u", "o"),
  multer("image", "images").single("image"),
  uploadImage,
);

export default router;
