import { apps } from "@/db/schemas/app";
import { comments } from "@/db/schemas/comment";
import { imageSourceEnum, userRoleEnum } from "@/db/schemas/enums";
import { notifications } from "@/db/schemas/notification";
import { timestamps } from "@/db/schemas/timestamps";
import { upvotes } from "@/db/schemas/upvote";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  about: text("about")
    .notNull()
    .default(
      "Building with Compyle AI. Sharing ideas and learning from the community."
    ),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  imageProviderFileId: text("imageProviderFileId"),
  imageSource: imageSourceEnum("imageSource").notNull().default("none"),
  role: userRoleEnum("role").notNull().default("user"),
  username: text("username").notNull(),
  displayUsername: text("displayUsername").notNull(),
  ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  apps: many(apps),
  upvotes: many(upvotes),
  notifications: many(notifications),
  commentsAuthored: many(comments, {
    relationName: "commentAuthor",
  }),
  commentsDeleted: many(comments, {
    relationName: "commentDeleter",
  }),
}));
