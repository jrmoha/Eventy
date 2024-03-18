import { validate } from "./../../interfaces/middleware/validator.middleware";
import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { edit_settings, get_settings } from "./settings.controller";
import { editSettingsSchema } from "./settings.validator";

const router = Router();

router.get("/all", authenticate(false, "u", "o"), get_settings);

router.patch(
  "/edit",
  authenticate(false, "u", "o"),
  validate(editSettingsSchema),
  edit_settings,
);

export default router;
