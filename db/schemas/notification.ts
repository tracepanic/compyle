import { notificationTypeEnum } from "@/db/schemas/enums";
import { timestamps } from "@/db/schemas/timestamps";
import { users } from "@/db/schemas/user";
import { createId } from "@paralleldrive/cuid2";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";

export const notifications = pgTable("notification", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: boolean("read").notNull().default(false),
    type: notificationTypeEnum("type").notNull().default("info"),
    link: text("link"),
    ...timestamps,
});