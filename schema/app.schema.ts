import { VALID_CATEGORIES, VALID_TECHNOLOGIES } from "@/data";
import z from "zod";

export const createAppSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters.")
    .max(32, "Name must be at most 32 characters."),
  slug: z
    .string()
    .regex(
      /^[a-z_]+$/,
      "Slug must contain only lowercase letters and underscores."
    ),
  description: z
    .string()
    .min(15, "Description must be at least 15 characters.")
    .max(1000, "Description must be at most 1000 characters."),
  category: z
    .string()
    .min(1, "Please select a category.")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .refine((cat) => VALID_CATEGORIES.includes(cat as any), {
      message: "Invalid category selected.",
    }),
  builtWith: z
    .array(z.string())
    .min(1, "Select at least one technology.")
    .max(10, "You can select up to 10 technologies.")
    .refine(
      (techs) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        techs.every((tech) => VALID_TECHNOLOGIES.includes(tech as any)),
      { message: "Invalid technology selected." }
    )
    .refine((techs) => new Set(techs).size === techs.length, {
      message: "Technologies must be unique.",
    }),
  websiteUrl: z
    .url("Must be a valid URL")
    .min(10, "URL must be at least 10 characters")
    .max(200, "URL must be at most 200 characters")
    .or(z.literal("")),
  repoUrl: z
    .url("Must be a valid URL")
    .min(10, "URL must be at least 10 characters")
    .max(200, "URL must be at most 200 characters")
    .or(z.literal("")),
  demoUrl: z
    .url("Must be a valid URL")
    .min(10, "URL must be at least 10 characters")
    .max(200, "URL must be at most 200 characters")
    .or(z.literal("")),
  status: z.enum(["draft", "published", "archived"], "Invalid app status"),
});
