import { TypeOf, z } from "zod";
import { Visibility } from "./settings.model";

export const editSettingsSchema = z.object({
  body: z
    .object({
      allow_marketing_emails: z.boolean().optional(),
      allow_reminders: z.boolean().optional(),
      friends_visibility: z.nativeEnum(Visibility).optional(),
      followers_visibility: z.nativeEnum(Visibility).optional(),
      following_visibility: z.nativeEnum(Visibility).optional(),
    })
    .refine(
      (data) => {
        return Object.keys(data).length > 0; // Check if at least one key is provided
      },
      {
        message: "At least one key must be provided",
        path: ["body"],
      },
    ),
});

export type EditSettingsInput = TypeOf<typeof editSettingsSchema>["body"];
