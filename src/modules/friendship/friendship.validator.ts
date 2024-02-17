import { object, string, TypeOf } from "zod";

export const unfriendSchema = object({
  params: object({
    id: string({
      required_error: "User id is required",
    }),
  }),
});

export type UnfriendInput = TypeOf<typeof unfriendSchema>["params"];
