import express, { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import * as OrderController from "./order.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { orderDetailsSchema } from "./order.validator";

const router = Router();

router.post(
  "/ticket",
  authenticate(false, "u", "o"),
  OrderController.orderTicket,
);
router.get(
  "/details/:enc",
  validate(orderDetailsSchema),
  OrderController.orderDetails,
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  OrderController.webhook,
);

export default router;
