import { Transaction } from "sequelize";
import { CreateEventInput } from "../event.validator";
import Category from "../../category/category.model";
import EventCategory from "./event.category.model";
import Event from "../event.model";

export class EventCategoryService {
  constructor() {}
  public async bulkCreateCategories(
    categories: CreateEventInput["categories"],
    event: Event,
    t?: Transaction,
  ) {
    const categories_set = new Set(Array.isArray(categories) ? categories : []);
    for (const category of categories_set) {
      const category_exists = await Category.findOne({
        where: { name: category },
      });
      if (!category_exists) categories_set.delete(category);
    }
    return EventCategory.bulkCreate(
      [...categories_set].map((category) => ({
        event_id: event.id,
        category,
      })),
      { transaction: t },
    );
  }
}
