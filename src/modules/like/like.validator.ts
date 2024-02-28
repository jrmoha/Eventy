import { TypeOf, z } from "zod";

export const likeSchema = z.object({
  params: z.object({
    event_id: z.preprocess(
      (a) => parseInt(z.string().parse(a), 10),
      z.number().gte(0, "Event id must be a positive number"),
    ),
  }),
});

export const unlikeSchema = z.object({
  params: z.object({
    event_id: z.preprocess(
      (a) => parseInt(z.string().parse(a), 10),
      z.number().gte(0, "Event id must be a positive number"),
    ),
  }),
});
export const getLikesSchema = z.object({
  params: z.object({
    event_id: z.preprocess(
      (a) => parseInt(z.string().parse(a), 10),
      z.number().gte(0, "Event id must be a positive number"),
    ),
  }),
});

export type LikeInput = TypeOf<typeof likeSchema>["params"];
export type UnlikeInput = TypeOf<typeof unlikeSchema>["params"];
export type GetLikesInput = TypeOf<typeof getLikesSchema>["params"];
