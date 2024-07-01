import { validate } from "./../../interfaces/middleware/validator.middleware";
import { Router } from "express";
import {
  addUserCategories,
  deleteUserCategory,
  getEventCategories,
  getUserCategories,
} from "./category.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import {
  addCategoriesSchema,
  deleteCategorySchema,
  getEventCategoriesSchema,
} from "./category.validator";

const router = Router();

router.post(
  "/add",
  authenticate(false, "u", "o"),
  validate(addCategoriesSchema),
  addUserCategories,
);
router.delete(
  "/delete/:name",
  authenticate(false, "u", "o"),
  validate(deleteCategorySchema),
  deleteUserCategory,
);
router.get(
  "/event/:id",
  validate(getEventCategoriesSchema),
  getEventCategories,
);
router.get("/me", authenticate(false, "u", "o"), getUserCategories);
export default router;
