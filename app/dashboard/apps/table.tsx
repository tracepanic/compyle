import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apps } from "@/db/schemas/app";
import { AppPublishStatus } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import { Edit, Ellipsis, Eye, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AppWithUpvotes = {
  app: InferSelectModel<typeof apps>;
  upvoteCount: number;
  commentCount: number;
};

export const columns = (
  onUpdateStatus: (data: { appId: string; status: AppPublishStatus }) => void,
  onDeleteApp: (appId: string) => void,
  isDeleting: boolean,
): ColumnDef<AppWithUpvotes>[] => [
  {
    accessorKey: "app.name",
    header: "App Name",
  },
  {
    accessorKey: "upvoteCount",
    header: "Upvotes",
    cell: ({ getValue }) => {
      const count = getValue() as number;
      return (
        <div className="flex items-center gap-1">
          <span className="font-medium">{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "commentCount",
    header: "Comments",
    cell: ({ getValue }) => {
      const count = getValue() as number;
      return (
        <div className="flex items-center gap-1">
          <span className="font-medium">{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "app.status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;

      if (status === "draft") {
        return (
          <Badge className="rounded-xs" variant="outline">
            DRAFT
          </Badge>
        );
      }

      if (status === "published") {
        return <Badge className="rounded-xs">PUBLISHED</Badge>;
      }

      if (status === "archived") {
        return (
          <Badge className="rounded-xs" variant="destructive">
            ARCHIVED
          </Badge>
        );
      }
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const app = row.original.app;
      return (
        <ActionsCell
          app={app}
          onUpdateStatus={onUpdateStatus}
          onDeleteApp={onDeleteApp}
          isDeleting={isDeleting}
        />
      );
    },
  },
];

const ActionsCell = ({
  app,
  onUpdateStatus,
  onDeleteApp,
  isDeleting,
}: {
  app: InferSelectModel<typeof apps>;
  onUpdateStatus: (data: { appId: string; status: AppPublishStatus }) => void;
  onDeleteApp: (appId: string) => void;
  isDeleting: boolean;
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AppPublishStatus>(
    app.status as AppPublishStatus,
  );

  const handleUpdateStatus = () => {
    onUpdateStatus({ appId: app.id, status: selectedStatus });
    setStatusOpen(false);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Ellipsis className="text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link className="flex gap-2" href={`/dashboard/apps/${app.id}`}>
              <Eye />
              View Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setStatusOpen(true);
            }}
          >
            <RefreshCw />
            Update Status
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link
              className="flex gap-2"
              href={`/dashboard/apps/edit/${app.id}`}
            >
              <Edit />
              Edit App Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="mr-2 text-destructive" />
            Delete App
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={statusOpen} onOpenChange={setStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update App Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change the status of &quot;{app.name}&quot;. This will affect the
              app&apos;s visibility and availability.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Select New Status
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as AppPublishStatus)
              }
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="draft">
                  Draft
                </SelectItem>
                <SelectItem className="cursor-pointer" value="published">
                  Published
                </SelectItem>
                <SelectItem className="cursor-pointer" value="archived">
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={handleUpdateStatus}
            >
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete App</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this app and all associated data
              including comments and likes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-foreground hover:bg-destructive/90"
              asChild
            >
              <Button
                className="cursor-pointer"
                variant="destructive"
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteOpen(false);
                  onDeleteApp(app.id);
                }}
              >
                Permanently Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
