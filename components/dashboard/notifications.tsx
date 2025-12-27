"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getNotifications, markAsRead, markAllAsRead } from "@/server/actions/notification";
import { cn } from "@/lib/utils";

// Notification type based on the database schema
type Notification = {
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

const MAX_VISIBLE_NOTIFICATIONS = 3;

const typeIcons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
};

const typeColors = {
    info: "text-blue-300",
    success: "text-green-300",
    warning: "text-yellow-300",
    error: "text-red-300",
};

export function Notifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications when popover opens
    useEffect(() => {
        if (isOpen) {
            getNotifications().then((data) => {
                setNotifications(data as Notification[]);
            });
        }
    }, [isOpen]);

    // Filter to only unread notifications
    const unreadNotifications = notifications.filter((n) => !n.read);
    const visibleNotifications = unreadNotifications.slice(0, MAX_VISIBLE_NOTIFICATIONS);
    const hasMore = unreadNotifications.length > MAX_VISIBLE_NOTIFICATIONS;
    const unreadCount = unreadNotifications.length;

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button className="ml-auto absolute relative bg-background hover:bg-background">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-2 h-3 w-3 rounded-full bg-primary text-[8px] font-medium text-white flex items-center justify-center tabular-nums">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[270px] mr-[20px] p-0 mt-[-10px]">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                    <p className="font-semibold text-base">Notifications</p>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto py-1 px-2 text-xs text-foreground bg-muted/90"
                            onClick={handleMarkAllAsRead}
                        >
                            <Check className="size-2.5 mr-1" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[250px] overflow-y-auto">
                    {visibleNotifications.length === 0 ? (
                        <div className="p-3 text-center text-muted-foreground text-sm">
                            No new notifications
                        </div>
                    ) : (
                        visibleNotifications.map((notification) => {
                            const Icon = typeIcons[notification.type];
                            return (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-2 p-2 bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0",
                                        !notification.read && "bg-muted/30"
                                    )}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    <div className={cn("mt-0.5", typeColors[notification.type])}>
                                        <Icon className="h-3 w-3" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* View All Button */}
                {hasMore && (
                    <div className="p-2 border-t">
                        <Button
                            variant="ghost"
                            className="w-full text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                router.push("/dashboard/notifications");
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}