import { comments } from "@/db/schemas/comment";
import { appStatusEnum, imageSourceEnum } from "@/db/schemas/enums";
import { timestamps } from "@/db/schemas/timestamps";
import { upvotes } from "@/db/schemas/upvote";
import { users } from "@/db/schemas/user";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";

export const apps = pgTable("app", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image"),
  imageProviderFileId: text("imageProviderFileId"),
  imageSource: imageSourceEnum("imageSource").notNull().default("imagekit"),
  websiteUrl: text("websiteUrl"),
  repoUrl: text("repoUrl"),
  demoUrl: text("demoUrl"),
  category: text("category").notNull(),
  builtWith: text("builtWith").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  status: appStatusEnum("status").notNull().default("published"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const appsRelations = relations(apps, ({ one, many }) => ({
  upvotes: many(upvotes),
  comments: many(comments),
  user: one(users, {
    fields: [apps.userId],
    references: [users.id],
  }),
}));
