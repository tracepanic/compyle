"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/providers/query.provider";
import { markAllAsRead, markAsRead } from "@/server/notification";
import { useNotificationStore } from "@/store/notification.store";
import { useMutation } from "@tanstack/react-query";
import { Bell, CheckCircle2, Dot } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function Notifications() {
  const { notifications } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onMutate: (id) => {
      setLoadingIds((prev) => [...prev, id]);
    },
    onSettled: (_, __, id) => {
      setLoadingIds((prev) => prev.filter((lid) => lid !== id));
    },
    onSuccess: () => {
      toast.success("Notification marked as read");
      queryClient.invalidateQueries({
        queryKey: ["user-header-dashboard-notifications"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({
        queryKey: ["user-header-dashboard-notifications"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="ml-auto relative hover:bg-background cursor-pointer md:-translate-x-64"
          variant="ghost"
          size="icon-lg"
        >
          <Bell />
          {notifications.length > 0 && (
            <Dot className="absolute size-7 -top-1 -right-1 animate-ping" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 mr-5 p-0 -mt-2.5">
        <div className="flex items-center justify-between p-3 border-b">
          <p className="font-semibold text-base">Notifications</p>
          <Link
            href="/dashboard/notifications"
            className="text-sm underline"
            onClick={() => setIsOpen(false)}
          >
            View All
          </Link>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground text-sm">
              No new unread notifications
            </div>
          ) : (
            notifications.map((n) => {
              return (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-2 pl-3 border-b last:border-b-0 hover:bg-muted transition-colors select-none"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => markNotificationAsReadMutation.mutate(n.id)}
                  >
                    {loadingIds.includes(n.id) ? (
                      <Spinner />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full cursor-pointer"
              onClick={() => markAllNotificationsAsReadMutation.mutate()}
            >
              {isLoading ? <Spinner /> : <CheckCircle2 />}
              Mark All As Read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
