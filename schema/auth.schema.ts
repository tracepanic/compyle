import z from "zod";

export const loginSchema = z.object({
  email: z
    .email("Inavalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(55, "Email must be at most 55 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(55, "Password must be at most 55 characters"),
});

export const updateEmailSchema = z.object({
  email: z
    .email("Inavalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(55, "Email must be at most 55 characters"),
});

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{5,32}$/,
      "Username must contain only lowercase letters, numbers and underscores."
    ),
});

export const updatePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(55, "Password must be at most 55 characters"),
  currentPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(55, "Password must be at most 55 characters"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(55, "Password must be at most 55 characters"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters.")
    .max(32, "Name must be at most 32 characters."),
  email: z
    .email("Inavalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(55, "Email must be at most 55 characters"),
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{5,32}$/,
      "Username must contain only lowercase letters, numbers and underscores."
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(55, "Password must be at most 55 characters"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters.")
    .max(32, "Name must be at most 32 characters."),
  about: z
    .string()
    .min(5, "About must be at least 5 characters")
    .max(500, "About must be at most 500 characters"),
});
