import { db } from "@/db";
import { notifications } from "@/db/schemas/notification";
import { users } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { EventEmitter } from "events";

export const notificationEvents = new EventEmitter();

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
};

export class NotificationService {
  /**
   * Send a notification to a specific user.
   * Saves to DB and emits an event for SSE.
   */
  static async send(data: CreateNotificationInput) {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type ?? "info",
        link: data.link,
      })
      .returning();

    notificationEvents.emit(`notification:${data.userId}`, newNotification);
    return newNotification;
  }

  /**
   * Broadcast a notification to all users.
   * (Optional utility)
   */
  static async broadcast(data: Omit<CreateNotificationInput, "userId">) {
    const allUsers = await db.select({ id: users.id }).from(users);

    const inputs = allUsers.map((user) => ({
      userId: user.id,
      title: data.title,
      message: data.message,
      type: data.type ?? "info",
      link: data.link,
    }));

    if (inputs.length === 0) return;

    const newNotifications = await db
      .insert(notifications)
      .values(inputs)
      .returning();

    newNotifications.forEach((n) => {
      notificationEvents.emit(`notification:${n.userId}`, n);
    });
  }
}
