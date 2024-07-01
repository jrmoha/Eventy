import { Router } from "express";
import { search } from "./search.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { searchSchema } from "./search.validator";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";

const router = Router();

router.get("/", authenticate(true, "u", "o"), validate(searchSchema), search);

export default router;
