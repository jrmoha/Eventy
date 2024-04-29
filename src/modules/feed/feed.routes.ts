import { Router } from "express";
import * as FC from "./feed.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { cache } from "../../interfaces/middleware/cache.middleware";

const router = Router();

router.get("/home", authenticate(true, "u", "o"), cache("feed"), FC.get_home);

export default router;
