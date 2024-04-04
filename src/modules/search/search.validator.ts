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
    date: z
      .enum([
        "today",
        "tomorrow",
        "this-week",
        "next-week",
        "this-month",
        "next-month",
      ])
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),
    from_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    category: z.string().trim().optional(),
    price: z.enum(["free", "paid"]).optional(),
    min_price: z.string().refine((data) => !isNaN(Number(data)), {
      message: "min_price must be a number",
    }),
    max_price: z.string().refine((data) => !isNaN(Number(data)), {
      message: "max_price must be a number",
    }),
  }),
  // .refine(
  //   (data) => {
  //     if (data.from_date && !data.to_date) {
  //       throw new Error("Both from_date and to_date are required");
  //     }
  //     if (data.to_date && !data.from_date) {
  //       throw new Error("Both from_date and to_date are required");
  //     }
  //     if (data.min_price && !data.max_price) {
  //       throw new Error("Both min_price and max_price are required");
  //     }
  //     if (data.max_price && !data.min_price) {
  //       throw new Error("Both min_price and max_price are required");
  //     }
  //     return true;
  //   },
  //   {
  //     params: { data: true },
  //   },
  // ),
});

export type SearchInput = TypeOf<typeof searchSchema>["query"];
