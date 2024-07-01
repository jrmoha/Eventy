import { TypeOf, z } from "zod";

export const communityMessageSchema = z.object({
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
export const communityMemberSchema = z.object({
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
  body: z.object({
    member_id: z
      .string({
        required_error: "User ID is required",
      })
      .refine((val) => {
        const num = Number(val);
        if (isNaN(num) || !Number.isInteger(num)) {
          throw new Error("User ID must be an integer");
        }
        return true;
      }),
  }),
});
export const deleteCommunitySchema = z.object({
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
export type CommunityMessageInput = TypeOf<typeof communityMessageSchema>;
export type AdminInput = TypeOf<typeof communityMemberSchema>;
export type DeleteCommunityInput = TypeOf<
  typeof deleteCommunitySchema
>["params"];
