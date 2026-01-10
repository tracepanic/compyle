"use client";

import { getHeaderNotifications } from "@/server/notification";
import { useNotificationStore } from "@/store/notification.store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function NotificationProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setNotifications } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ["user-header-dashboard-notifications"],
    queryFn: () => getHeaderNotifications(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    staleTime: 0,
    refetchInterval: 30000,
    retry: false,
  });

  useEffect(() => {
    setNotifications(data ?? []);
  }, [data, setNotifications, isLoading]);

  return <>{children}</>;
}
