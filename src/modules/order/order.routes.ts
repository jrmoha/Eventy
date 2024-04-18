import express, { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { cancel, orderTicket, success, webhook } from "./order.controller";

const router = Router();

router.post("/ticket", authenticate(false, "u", "o"), orderTicket);
router.post("/webhook", express.raw({ type: "application/json" }), webhook);
router.get("/success", success);
router.get("/cancel", cancel);

export default router;
