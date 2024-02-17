import { validate } from "./../../interfaces/middleware/validator.middleware";
import { Router } from "express";
import { addCategory, deleteCategory } from "./category.controller";
import { authenticate } from "../../interfaces/middleware/authentication.middleware";
import {
  addCategoriesSchema,
  deleteCategorySchema,
} from "./category.validator";

const router = Router();

router.post(
  "/add",
  authenticate("u", "o"),
  validate(addCategoriesSchema),
  addCategory,
);
router.delete(
  "/delete/:name",
  authenticate("u", "o"),
  validate(deleteCategorySchema),
  deleteCategory,
);

export default router;
