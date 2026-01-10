import { apps } from "@/db/schemas/app";
import { timestamps } from "@/db/schemas/timestamps";
import { users } from "@/db/schemas/user";
import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const upvotes = pgTable(
  "upvote",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appId: text("appId")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.userId, table.appId] })]
);

export const upvotesRelations = relations(upvotes, ({ one }) => ({
  user: one(users, {
    fields: [upvotes.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [upvotes.appId],
    references: [apps.id],
  }),
}));
