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
