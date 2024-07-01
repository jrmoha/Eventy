import { TypeOf, z } from "zod";
import { APIError } from "../../error/api-error";
import { StatusCodes } from "http-status-codes";

export const createRateSchema = z.object({
  body: z
    .object({
      rate: z.string({
        required_error: "Rate is required",
      }),
      review: z
        .string({
          required_error: "Review is required",
        })
        .min(1)
        .max(500),
    })
    .refine((data) => {
      const rate = parseInt(data.rate, 10);
      if (isNaN(rate)) {
        throw new APIError("Rate must be a number", StatusCodes.BAD_REQUEST);
      }
      if (rate < 1 || rate > 5) {
        throw new APIError(
          "Rate must be between 1 and 5",
          StatusCodes.BAD_REQUEST,
        );
      }
      return true;
    }),
  params: z.object({
    event_id: z
      .string({
        required_error: "Event id is required",
      })
      .transform((a) => parseInt(a, 10)),
  }),
});

export type CreateRateInput = TypeOf<typeof createRateSchema>;
