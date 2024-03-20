import { TypeOf, z } from "zod";
import { APIError } from "../../types/APIError.error";
import { StatusCodes } from "http-status-codes";

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
export const updateEmailSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "email is required",
      })
      .email(),
  }),
});
export const changePasswordSchema = z.object({
  body: z
    .object({
      old_password: z
        .string({
          required_error: "old_password is required",
        })
        .min(6)
        .max(100),
      new_password: z
        .string({
          required_error: "new_password is required",
        })
        .min(6)
        .max(100),
      new_password_confirmation: z.string({
        required_error: "new_password_confirmation is required",
      }),
    })
    .refine(
      (data) => {
        if (data.new_password !== data.new_password_confirmation)
          throw new APIError("Passwords do not match", StatusCodes.BAD_REQUEST);

        if (data.old_password === data.new_password)
          throw new APIError(
            "New password cannot be the same as the old password",
            StatusCodes.BAD_REQUEST,
          );

        return true;
      },
      {
        message: "Passwords do not match",
      },
    ),
});

export type UpdateUserInput = TypeOf<typeof updateUserSchema>["body"];
export type ChangePasswordInput = TypeOf<typeof changePasswordSchema>["body"];
export type ChangeEmailInput = TypeOf<typeof updateEmailSchema>["body"];
