"use server";

import { db } from "@/db";
import { notifications } from "@/db/schemas/notification";
import { and, desc, eq } from "drizzle-orm";
import { getUserFromAuth } from "../user";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  link: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getNotifications(): Promise<Notification[]> {
  try {
    const user = await getUserFromAuth();

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return result as Notification[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch notifications");
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const user = await getUserFromAuth();

    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to mark notification as read");
  }
}

export async function markAsUnread(notificationId: string) {
  try {
    const user = await getUserFromAuth();

    await db
      .update(notifications)
      .set({ read: false })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to mark notification as unread");
  }
}

export async function markAllAsRead() {
  try {
    const user = await getUserFromAuth();

    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, user.id));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to mark all notifications as read");
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const user = await getUserFromAuth();

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to delete notification");
  }
}
