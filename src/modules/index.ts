import { Router } from "express";
import authRoutes from "./authentication/authentication.routes";
import userRoutes from "./user/user.routes";
import categoryRoutes from "./category/category.routes";
import eventRoutes from "./event/event.routes";
import pollRoutes from "./poll/poll.routes";

const router = Router();

router.use("/api/v1/authentication", authRoutes);
router.use("/api/v1/users", userRoutes);
router.use("/api/v1/categories", categoryRoutes);
router.use("/api/v1/events", eventRoutes);
router.use("/api/v1/polls", pollRoutes);
export default router;
