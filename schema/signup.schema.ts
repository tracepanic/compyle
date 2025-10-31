import * as z from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters.")
    .max(32, "Name must be at most 32 characters."),
  email: z
    .email("Inavalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(55, "Email must be at most 55 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(55, "Password must be at most 55 characters"),
});
