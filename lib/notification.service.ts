import { db } from "@/db";
import { notifications } from "@/db/schemas/notification";
import { users } from "@/db/schemas/user";

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
};

// Get the transaction context type (the 'tx' parameter inside db.transaction callback)
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class NotificationService {
  static async send(data: CreateNotificationInput) {
    try {
      const [newNotification] = await db
        .insert(notifications)
        .values({
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link,
        })
        .returning();
      return newNotification;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to send notification");
    }
  }

  static async sendWithTx(tx: Transaction, data: CreateNotificationInput) {
    try {
      const [newNotification] = await tx
        .insert(notifications)
        .values({
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link,
        })
        .returning();
      return newNotification;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to send notification");
    }
  }

  static async broadcast(data: Omit<CreateNotificationInput, "userId">) {
    try {
      const allUsers = await db.select({ id: users.id }).from(users);

      const inputs = allUsers.map((user) => ({
        userId: user.id,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      }));

      if (inputs.length === 0) return [];

      const newNotifications = await db
        .insert(notifications)
        .values(inputs)
        .returning();

      return newNotifications;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to broadcast notification");
    }
  }
}
