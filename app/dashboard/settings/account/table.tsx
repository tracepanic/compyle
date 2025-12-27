import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revokeSession } from "@/lib/auth-client";
import { queryClient } from "@/providers/query.provider";
import { ColumnDef } from "@tanstack/react-table";
import { LogOut, MapPin } from "lucide-react";
import { toast } from "sonner";

export type SessionTable = {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastSignIn: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
  sessionToken: string;
};

export const columns: ColumnDef<SessionTable>[] = [
  {
    accessorKey: "userAgent",
    header: "Device",
    cell: ({ row }) => {
      const ua = row.original.userAgent;
      const isCurrent = row.original.isCurrent;

      // Detect OS (check mobile OS first)
      const os = ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone") || ua.includes("iPad")
          ? "iOS"
          : ua.includes("Windows")
            ? "Windows"
            : ua.includes("Mac")
              ? "macOS"
              : ua.includes("Linux")
                ? "Linux"
                : "Unknown";

      // Detect browser
      const browser = ua.includes("Edg")
        ? "Edge"
        : ua.includes("Chrome")
          ? "Chrome"
          : ua.includes("Firefox")
            ? "Firefox"
            : ua.includes("Safari") && !ua.includes("Chrome")
              ? "Safari"
              : "Browser";

      const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {browser} on {os}
            </span>
            {isCurrent && (
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {isMobile ? "Mobile" : "Desktop"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    header: "Location",
    cell: ({ row }) => {
      const ip = row.original.ipAddress;
      // An IP geolocation API could be used here
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{ip}</div>
            <div className="text-sm text-muted-foreground">
              {ip === "127.0.0.1" ? "Local" : "Unknown location"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "lastSignIn",
    header: "Last Accessed",
    cell: ({ row }) => {
      const date = row.original.lastSignIn;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo = "";
      if (diffMins < 1) timeAgo = "Just now";
      else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
      else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
      else timeAgo = `${diffDays}d ago`;

      return (
        <div>
          <div className="font-medium">{timeAgo}</div>
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()} at{" "}
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const isCurrent = row.original.isCurrent;
      const sessionToken = row.original.sessionToken;

      const handleRevoke = async () => {
        const id = toast.loading("Revoking session...");
        const { error } = await revokeSession({ token: sessionToken });

        toast.dismiss(id);
        if (error) {
          toast.error("Failed to revoke session");
        } else {
          toast.success("Session revoked successfully");
          queryClient.invalidateQueries({ queryKey: ["all-sessions"] });
        }
      };

      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isCurrent}
              className="text-destructive hover:text-destructive cursor-pointer"
            >
              {isCurrent ? (
                <MapPin className="h-4 w-4 mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {isCurrent ? "Current" : "Revoke"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will sign out the device from your account. You&apos;ll
                need to sign in again to access your account on that device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                className="bg-destructive cursor-pointer text-destructive-foreground hover:bg-destructive/90"
              >
                Revoke Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
