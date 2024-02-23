import { TypeOf, z } from "zod";

export const voteSchema = z.object({
  params: z.object({
    poll_id: z.string({ required_error: "Poll id is required" }),
    option_id: z.string({ required_error: "Option id is required" }),
  }),
});

export type VoteInput = TypeOf<typeof voteSchema>["params"];
