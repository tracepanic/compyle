"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, markAsUnread, type Notification } from "@/server/actions/notification";
import { cn } from "@/lib/utils";

const typeIcons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
};

const typeColors = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-destructive",
};

const typeBgColors = {
    info: "bg-blue-500/10",
    success: "bg-green-500/10",
    warning: "bg-yellow-500/10",
    error: "bg-destructive/10",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        getNotifications()
            .then((data) => {
                setNotifications(data as Notification[]);
            })
            .finally(() => {
                setIsPending(false);
            });
    }, []);

    const unreadNotifications = notifications.filter((n) => !n.read);
    const readNotifications = notifications.filter((n) => n.read);
    const unreadCount = unreadNotifications.length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleMarkAsUnread = async (id: string) => {
        try {
            await markAsUnread(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: false } : n))
            );
        } catch (error) {
            console.error("Error marking notification as unread:", error);
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const NotificationItem = ({ notification }: { notification: Notification }) => {
        const Icon = typeIcons[notification.type];
        const router = useRouter();

        const handleNotificationClick = async () => {
            if (!notification.read) {
                await handleMarkAsRead(notification.id);
            }
            if (notification.link) {
                router.push(notification.link);
            }
        };

        return (
            <div
                className={cn(
                    "flex items-start gap-4 p-4 border-b last:border-b-0 transition-colors hover:bg-muted/50 cursor-pointer",
                    !notification.read && "bg-muted/30"
                )}
                onClick={handleNotificationClick}
            >
                <div className={cn("p-2 rounded-lg", typeBgColors[notification.type])}>
                    <Icon className={cn("size-4", typeColors[notification.type])} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.read && (
                            <span className="size-2 rounded-full bg-primary" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.createdAt)}
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {!notification.read && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                            }}
                        >
                            <Check className="size-4" />
                        </Button>
                    )}
                    {notification.read && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsUnread(notification.id);
                            }}
                        >
                            <Undo2 className="size-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                        }}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
                <Bell className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{message}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                        <Check className="size-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <Card className="bg-background">
                <CardContent className="pt-4">
                    {isPending ? (
                        <div className="flex justify-center py-8">
                            <Spinner className="size-6" />
                        </div>
                    ) : (
                        <Tabs defaultValue="unread">
                            <TabsList>
                                <TabsTrigger value="unread" className="cursor-pointer">
                                    Unread ({unreadCount})
                                </TabsTrigger>
                                <TabsTrigger value="all" className="cursor-pointer">
                                    Read ({readNotifications.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="unread" className="mt-4">
                                {unreadNotifications.length === 0 ? (
                                    <EmptyState message="No unread notifications" />
                                ) : (
                                    <div className="border rounded-lg divide-y">
                                        {unreadNotifications.map((notification) => (
                                            <NotificationItem
                                                key={notification.id}
                                                notification={notification}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="all" className="mt-4">
                                {readNotifications.length === 0 ? (
                                    <EmptyState message="No read notifications" />
                                ) : (
                                    <div className="border rounded-lg divide-y">
                                        {readNotifications.map((notification) => (
                                            <NotificationItem
                                                key={notification.id}
                                                notification={notification}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}