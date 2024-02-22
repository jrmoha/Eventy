import { TypeOf, object, array, string, date, boolean, number } from "zod";

export const createEventSchema = object({
  body: object({
    content: string({
      required_error: "Content is required",
    }).trim(),
    location: string({
      required_error: "Location is required",
    }).trim(),
    date: date({
      required_error: "Date is required",
    }),
    time: string({
      required_error: "Time is required",
    }).trim(),
    phone_numbers: array(
      string({
        required_error: "Phone numbers are required",
      }).trim(),
    ),
    agenda: array(
      object({
        description: string({
          required_error: "Description is required",
        }).trim(),
        start_time: string({
          required_error: "Start time is required",
        }).trim(),
        end_time: string({
          required_error: "End time is required",
        }).trim(),
      }),
    ),
    allow_community: boolean(),
    tickets: array(
      object({
        price: number({
          required_error: "Price is required",
        }),
        quantity: number({
          required_error: "Quantity is required",
        }),
        class: string({
          required_error: "Class is required",
        }).trim(),
        available: number({
          required_error: "Available is required",
        }),
      }),
    ),
    faqs: array(
      object({
        question: string({
          required_error: "Question is required",
        }).trim(),
        answer: string({
          required_error: "Answer is required",
        }).trim(),
      }),
    ),
    categories: array(
      string({
        required_error: "Categories are required",
      }).trim(),
    ),
  }),
  files: array(
    object({
      fieldname: string(),
      originalname: string(),
      encoding: string(),
      mimetype: string(),
      destination: string(),
      filename: string(),
      path: string(),
      size: number(),
    }),
  ),
});

export type CreateEventInput = TypeOf<typeof createEventSchema>["body"];
