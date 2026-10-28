import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  interest: z.enum(["training", "labs", "team", "content", "other"], {
    errorMap: () => ({ message: "Choose a topic" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(1000, "Message must be under 1000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
