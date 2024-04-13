import { Router } from "express";
import { create, get_poll, unvote, vote } from "./poll.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { voteSchema } from "./poll.validator";
// import { cache } from "../../interfaces/middleware/cache.middleware";

const router = Router();

router.post("/create", authenticate(false, "u", "o"), create);
router.get(
  "/:id",
  authenticate(false, "u", "o"),
  //  cache("poll"),
  get_poll,
);

router.post(
  "/:poll_id/vote/:option_id",
  authenticate(false, "u", "o"),
  validate(voteSchema),
  vote,
);
router.patch(
  "/:poll_id/unvote/:option_id",
  authenticate(false, "u", "o"),
  validate(voteSchema),
  unvote,
);
export default router;
