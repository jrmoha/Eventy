import { Router } from "express";
import { search } from "./search.controller";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { searchSchema } from "./search.validator";

const router = Router();

router.get("/", validate(searchSchema), search);

export default router;
