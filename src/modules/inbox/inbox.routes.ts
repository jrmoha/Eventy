import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { get_inboxes } from "./inbox.controller";

const router = Router();

router.get("/inbox", authenticate(false, "u", "o"), get_inboxes);

export default router;
