import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { createRateSchema } from "./rate.validator";
import * as RateController from "./rate.controller";

const router = Router({ mergeParams: true });

router.post(
  "/rate",
  authenticate(false, "u", "o"),
  validate(createRateSchema),
  RateController.rate,
);

export default router;
