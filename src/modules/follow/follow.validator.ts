import { object, TypeOf, string } from "zod";

export const followSchema = object({
  params: object({
    id: string({
      required_error: "Followed id is required",
    }),
  }),
});

export type FollowInput = TypeOf<typeof followSchema>["params"];
