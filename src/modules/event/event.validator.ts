import { TypeOf, z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    content: z
      .string({
        required_error: "Content is required",
      })
      .trim(),
    location: z
      .string({
        required_error: "Location is required",
      })
      .trim(),
    date: z.string({
      required_error: "Date is required",
    }),
    time: z
      .string({
        required_error: "Time is required",
      })
      .trim(),
    phone_numbers: z
      .array(
        z
          .string({
            required_error: "Phone numbers are required",
          })
          .trim(),
      )
      .optional()
      .or(z.string())
      .default([]),
    agenda: z
      .array(
        z.object({
          description: z
            .string({
              required_error: "Description is required",
            })
            .trim(),
          start_time: z
            .string({
              required_error: "Start time is required",
            })
            .trim(),
          end_time: z
            .string({
              required_error: "End time is required",
            })
            .trim(),
        }),
      )
      .default([]),
    allow_community: z.coerce.boolean().default(false),
    tickets: z
      .array(
        z.object({
          price: z.preprocess(
            (p) => parseFloat(z.string().parse(p)),
            z.number().gte(0, "Must be 1 and above"),
          ),
          quantity: z.preprocess(
            (q) => parseInt(z.string().parse(q), 10),
            z.number().gt(0, "Must be 1 and above"),
          ),
          class: z
            .string({
              required_error: "Class is required",
            })
            .trim(),
          available: z.preprocess(
            (q) => parseInt(z.string().parse(q), 10),
            z.number().gte(0, "Must be 1 and above"),
          ),
        }),
      )
      .default([]),
    faqs: z
      .array(
        z.object({
          question: z
            .string({
              required_error: "Question is required",
            })
            .trim(),
          answer: z
            .string({
              required_error: "Answer is required",
            })
            .trim(),
        }),
      )
      .default([]),
    categories: z
      .array(
        z
          .string({
            required_error: "Categories are required",
          })
          .trim(),
      )
      .optional()
      .or(z.string())
      .default([]),
  }),
  files: z
    .array(
      z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        destination: z.string(),
        filename: z.string(),
        path: z.string(),
        size: z.number(),
      }),
    )
    .min(1, {
      message: "At least one file is required",
    }),
});
export const interestSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (id) => parseInt(z.string().parse(id), 10),
      z.number().gte(1, "Must be 1 and above"),
    ),
  }),
});

export type CreateEventInput = TypeOf<typeof createEventSchema>["body"];
export type InterestInput = TypeOf<typeof interestSchema>["params"];
