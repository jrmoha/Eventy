import { authenticate } from "./../../interfaces/middleware/authentication.middleware";
import { Router } from "express";
import { create, get, interest } from "./event.controller";
import upload from "../../utils/multer";
import config from "config";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { createEventSchema, interestSchema } from "./event.validator";
import likeRoutes from "../like/like.routes";
import searchRoutes from "../search/search.routes";
// import { cache } from "../../interfaces/middleware/cache.middleware";

const router = Router();

router.use("/search", searchRoutes);
router.use("/:event_id", likeRoutes);

router.post(
  "/create",
  authenticate(false, "o", "u"),
  upload("image", "images").array(
    "images",
    config.get<number>("maxImageCount"),
  ),
  validate(createEventSchema),
  create,
);
router.get(
  "/event/:id",
  authenticate(true, "u", "o"),
  // cache("event"),
  get,
);
router.post(
  "/:id/interest",
  authenticate(false, "o", "u"),
  validate(interestSchema),
  interest,
);

export default router;
