import { TypeOf, z } from "zod";

export const sendMessageInCommunitySchema = z.object({
  body: z.object({
    message: z
      .string({
        required_error: "Message is required",
      })
      .min(1)
      .max(255),
  }),
  params: z.object({
    id: z
      .string({
        required_error: "Community ID is required",
      })
      .refine((val) => {
        const num = Number(val);
        if (isNaN(num) || !Number.isInteger(num)) {
          throw new Error("Community ID must be an integer");
        }
        return true;
      }),
  }),
});

export type sendMessageInCommunityInput = TypeOf<
  typeof sendMessageInCommunitySchema
>;
