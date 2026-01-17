import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("UserRole", ["user", "admin"]);
export const appStatusEnum = pgEnum("AppStatus", [
  "draft",
  "archived",
  "published",
]);
export const commentDeleterEnum = pgEnum("CommentDeleter", [
  "author",
  "appOwner",
]);
export const notificationTypeEnum = pgEnum("NotificationType", [
  "info",
  "success",
  "warning",
  "error",
]);
export const imageSourceEnum = pgEnum("ImageSource", [
  "oauth",
  "imagekit",
  "custom",
  "none",
]);
