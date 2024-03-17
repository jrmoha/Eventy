import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { get_communities, join, leave } from "./community.controller";

const router = Router();

router.get("/all", authenticate(false, "u", "o"), get_communities);
router.post("/join/:id", authenticate(false, "u", "o"), join);
router.delete("/leave/:id", authenticate(false, "u", "o"), leave);

export default router;
