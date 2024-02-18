import { z } from "zod";

export const uploadImageSchema = z.object({
  file: z.object(
    {
      path: z.string({ required_error: "path is required" }),
      size: z.number({ required_error: "size is required" }),
      mimetype: z.string({ required_error: "mimetype is required" }),
      destination: z.string({ required_error: "destination is required" }),
      originalname: z.string({ required_error: "originalname is required" }),
      filename: z.string({ required_error: "filename is required" }),
    },
    {
      required_error: "Image is required",
    },
  ),
});
export const updateUserSchema = z.object({
  body: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      username: z.string().optional(),
      email: z.string().email().optional(),
      phone_number: z.string().optional(),
      birthdate: z.string().optional(),
      gender: z.enum(["male", "female"]).optional(),
    })
    .refine(
      (data) => {
        if (Object.keys(data).length === 0) {
          throw new Error("At least one field is required");
        }
        return true;
      },
      {
        message: "At least one field is required",
      },
    ),
});

export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>["body"];
