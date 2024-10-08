import { TypeOf, array, object, string } from "zod";

export const addCategoriesSchema = object({
  body: object({
    categories: array(
      string({ required_error: "Category is required" }).min(1).max(255),
    ).min(1),
  }),
});

export const deleteCategorySchema = object({
  params: object({
    name: string({ required_error: "Category name is required" }),
  }),
});
export const getEventCategoriesSchema = object({
  params: object({
    id: string({ required_error: "Event id is required" }),
  }),
});

export type AddCategoriesInput = TypeOf<typeof addCategoriesSchema>["body"];
export type DeleteCategoryInput = TypeOf<typeof deleteCategorySchema>["params"];
export type GetEventCategoriesInput = TypeOf<
  typeof getEventCategoriesSchema
>["params"];
