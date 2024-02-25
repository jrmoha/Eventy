import { TypeOf, object, string, z } from "zod";

export const signupSchema = object({
  body: object({
    username: string({
      required_error: "Username Is Required",
    }).trim(),
    email: string({
      required_error: "Email Is Required",
    })
      .email()
      .trim(),
    phone_number: string({
      required_error: "Phone Number Is Required",
    }).trim(),
    first_name: string({
      required_error: "First Name Is Required",
    }).trim(),
    last_name: string({
      required_error: "Last Name Is Required",
    }).trim(),
    password: string({
      required_error: "Password Is Required",
    }).min(6, "Password Must Have Length More than six digits"),
    password_confirmation: string({
      required_error: "Password Confirmation Is Required",
    }),
    birthdate: string({
      required_error: "Birthdate Is Required",
    }).trim(),
    gender: z.enum(["male", "female"], {
      required_error: "Gender is required",
    }),
  }).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords Don't Match.",
    path: ["password_confirmation"],
  }),
});

export const loginSchema = object({
  body: object({
    query: string({
      required_error: "Username or Email or Phone Are Required",
    }).trim(),
    password: string({
      required_error: "Password Is Required",
    }),
  }),
});
export const emailVerificationSchema = object({
  query: object({
    t: string({
      required_error: "Token Is Required",
    }).trim(),
  }),
});
export const forgotPasswordSchema = object({
  body: object({
    query: string({
      required_error: "Email Is Required",
    }).trim(),
  }),
});
export const resetPasswordSchema = object({
  body: object({
    password: string({
      required_error: "Password Is Required",
    }).min(6, "Password Must Have Length More than six digits"),
    password_confirmation: string({
      required_error: "Password Confirmation Is Required",
    }),
  }).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords Don't Match.",
    path: ["password_confirmation"],
  }),
  query: object({
    t: string({
      required_error: "Token Is Required",
    }).trim(),
  }),
});
export type SignupInput = TypeOf<typeof signupSchema>["body"];
export type LoginInput = TypeOf<typeof loginSchema>["body"];
export type EmailInput = TypeOf<typeof emailVerificationSchema>["query"];
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
