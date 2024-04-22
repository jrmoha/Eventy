import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Category from "./category.model";
import { APIError } from "../../error/api-error";
import StatusCodes from "http-status-codes";
import UserCategory from "./user.category.model";
import {
  AddCategoriesInput,
  DeleteCategoryInput,
  GetEventCategoriesInput,
} from "./category.validator";
import Event from "../event/event.model";
import EventCategory from "./event.category.model";

export const addUserCategories = async_(
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
export const deleteUserCategory = async_(
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

export const getEventCategories = async_(
  async (
    req: Request<GetEventCategoriesInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event)
      throw new APIError("Event doesn't exist", StatusCodes.NOT_FOUND);

    const categories = await EventCategory.findAll({ where: { event_id: id } });

    return res.status(StatusCodes.OK).json({ success: true, data: categories });
  },
);
export const getUserCategories = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const userCategories = await UserCategory.findAll({
      where: { id: user_id },
    });

    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: userCategories });
  },
);
