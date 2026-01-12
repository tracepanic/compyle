"use client";

import { getHeaderNotifications } from "@/server/notification";
import { useNotificationStore } from "@/store/notification.store";
import { useAuthStore } from "@/store/session.store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function NotificationProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setNotifications } = useNotificationStore();
  const { isInitialPending, authInfo } = useAuthStore();

  const isEnabled = !isInitialPending && Boolean(authInfo?.session);

  const { data } = useQuery({
    queryKey: ["user-header-dashboard-notifications"],
    queryFn: getHeaderNotifications,
    enabled: isEnabled,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    staleTime: 0,
    refetchInterval: 30000,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data, setNotifications]);

  return <>{children}</>;
}
