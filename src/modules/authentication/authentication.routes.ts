import { Router } from "express";
import {
  emailVerification,
  forgotPassword,
  login,
  resendEmailVerification,
  reset_password,
  signup,
} from "./authentication.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import {
  emailVerificationSchema,
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
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
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), reset_password);

export default router;
