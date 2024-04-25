import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { get_inboxes } from "./inbox.controller";
import messagesRoute from "./message/message.routes";

const router = Router();

router.use("/inbox/:inbox_id", messagesRoute);
router.get("/inbox", authenticate(false, "u", "o"), get_inboxes);

export default router;
