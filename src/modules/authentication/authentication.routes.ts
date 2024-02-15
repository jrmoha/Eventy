import { Router } from "express";
import {
  emailVerification,
  forgotPassword,
  login,
  resendEmailVerification,
  signup,
} from "./authentication.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import {
  emailVerificationSchema,
  loginSchema,
  signupSchema,
  passwordResetSchema,
} from "./authentication.schema";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get(
  "/email/activate",
  validate(emailVerificationSchema),
  emailVerification,
);
router.get(
  "/email/resend-activation",
  validate(emailVerificationSchema),
  resendEmailVerification,
);
router.post(
  "/forgot-password",
  validate(passwordResetSchema),
  forgotPassword,
);

export default router;
