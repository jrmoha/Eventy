import { Router } from "express";
import { make_attendance } from "./attendance.controller";

const router = Router();

router.post("/attend/:enc", make_attendance);

export default router;
