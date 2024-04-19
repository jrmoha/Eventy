import { z } from "zod";

export const orderDetailsSchema = z.object({
  params: z.object({
    order_id: z
      .string({
        required_error: "order_id is required",
      })
      .uuid(),
  }),
});

export type OrderDetailsInput = z.TypeOf<typeof orderDetailsSchema>["params"];
