import { Router } from "express";
import followRoutes from "../follow/follow.routes";
import friendRequestRoutes from "../friendrequest/friendrequest.routes";
import friendshipRoutes from "../friendship/friendship.routes";

const router = Router();
router.use(followRoutes);
router.use(friendRequestRoutes);
router.use(friendshipRoutes);

export default router;
