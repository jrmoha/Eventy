import { Router } from "express";
import { get_messages, send_message } from "./message.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";

const router = Router({ mergeParams: true });

router.get("/messages", authenticate(false, "u", "o"), get_messages);
router.post("/send", authenticate(false, "u", "o"), send_message);

export default router;
