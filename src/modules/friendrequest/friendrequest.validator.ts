import { object, TypeOf, string } from "zod";

export const friendRequestSchema = object({
  params: object({
    id: string({
      required_error: "User id is required",
    }),
  }),
});

export type FriendRequestInput = TypeOf<typeof friendRequestSchema>["params"];
