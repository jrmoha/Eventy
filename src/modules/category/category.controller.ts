import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Category from "./category.model";
import { APIError } from "../../types/APIError.error";
import StatusCodes from "http-status-codes";
import UserCategory from "./user.category.model";
import { AddCategoriesInput, DeleteCategoryInput } from "./category.validator";

export const addCategory = async_(
  async (
    req: Request<{}, {}, AddCategoriesInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { categories } = req.body;

    for (const category of categories) {
      const category_ = await Category.findByPk(category);
      if (!category_)
        throw new APIError(
          `Category ${category} not found`,
          StatusCodes.NOT_FOUND,
        );

      const userCategory = await UserCategory.findOne({
        where: { id: user_id, name: category },
      });
      if (userCategory)
        throw new APIError(
          `Category ${category} already exists`,
          StatusCodes.CONFLICT,
        );
    }

    const userCategories = await UserCategory.bulkCreate(
      categories.map((category) => ({ id: user_id, name: category })),
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, data: userCategories });
  },
);
export const deleteCategory = async_(
  async (
    req: Request<DeleteCategoryInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { name } = req.params;

    const userCategory = await UserCategory.findOne({
      where: { id: user_id, name },
    });

    if (!userCategory)
      throw new APIError(`Category ${name} not found`, StatusCodes.NOT_FOUND);

    await userCategory.destroy();

    return res.status(StatusCodes.OK).json({ success: true });
  },
);
