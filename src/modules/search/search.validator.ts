import { TypeOf, z } from "zod";

export const searchSchema = z.object({
  query: z.object({
    q: z
      .string({
        required_error: "Query is required",
      })
      .min(3, "Query must be at least 3 characters long")
      .trim(),
    location: z
      .string()
      .min(3, "Location must be at least 3 characters long")
      .trim()
      .optional(),
  }),
});

export type SearchInput = TypeOf<typeof searchSchema>["query"];
