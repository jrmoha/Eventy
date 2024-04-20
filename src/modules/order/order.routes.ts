import express, { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import * as OrderController from "./order.controller";

const router = Router();

router.post(
  "/ticket",
  authenticate(false, "u", "o"),
  OrderController.orderTicket,
);
router.get(
  "/details/:enc",
  // validate(orderDetailsSchema),
  OrderController.orderDetails,
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  OrderController.webhook,
);
router.get("/success", OrderController.success);
router.get("/cancel", OrderController.cancel);

export default router;
