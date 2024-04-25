import { z } from "zod";

export const orderDetailsSchema = z.object({
  params: z.object({
    enc: z.string({
      required_error: "order is required",
    }),
  }),
});

export type OrderDetailsInput = z.TypeOf<typeof orderDetailsSchema>["params"];
