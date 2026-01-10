import { notifications } from "@/db/schemas/notification";
import { create } from "zustand";

const MAX_NOTIFICATIONS = 3;

type Notification = typeof notifications.$inferSelect;

type NotificationStore = {
  notifications: Notification[];
  maxNotifications: number;
};

type NotificationStoreActions = {
  setNotifications: (notifications: Notification[]) => void;
};

export const useNotificationStore = create<
  NotificationStore & NotificationStoreActions
>((set) => ({
  notifications: [],
  maxNotifications: MAX_NOTIFICATIONS,

  setNotifications: (notifications) =>
    set(() => ({
      notifications: notifications.slice(0, MAX_NOTIFICATIONS),
    })),
}));
