"use server";

import { db } from "@/db";
import { notifications } from "@/db/schemas/notification";
import { auth } from "@/lib/auth"; // Assuming auth import
import { desc, eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function getNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      )
    );
}

export async function markAllAsRead() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, session.user.id));
}
