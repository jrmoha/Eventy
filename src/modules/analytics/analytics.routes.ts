import { Router } from "express";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import * as analyticsController from "./analytics.controller";

const router = Router();

router.get("/overview", authenticate(true, "o"), analyticsController.overview);

export default router;
