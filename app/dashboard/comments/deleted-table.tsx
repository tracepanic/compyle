import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DeletedComment = {
  id: string;
  content: string;
  createdAt: Date;
  deletedAt: Date;
  deleter: "author" | "appOwner";
  deleteReason: string | null;
  app: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    owner: {
      id: string;
      name: string;
      username: string;
    };
  };
};

export const columns = (
  onViewComment: (comment: DeletedComment) => void,
): ColumnDef<DeletedComment>[] => [
  {
    accessorKey: "content",
    header: "Comment",
    cell: ({ row }) => (
      <div className="max-w-72 md:max-w-110 lg:max-w-135 truncate">
        {row.original.content}
      </div>
    ),
  },
  {
    accessorKey: "app.name",
    header: "App Name",
    cell: ({ row }) => (
      <div className="max-w-40 truncate">{row.original.app.name}</div>
    ),
  },
  {
    accessorKey: "deleter",
    header: "Deleted By",
    cell: ({ row }) => {
      if (row.original.deleter === "appOwner") {
        return (
          <Badge variant="outline" className="rounded-xs">
            APP OWNER
          </Badge>
        );
      }

      return (
        <Badge variant="outline" className="rounded-xs">
          MYSELF
        </Badge>
      );
    },
  },
  {
    accessorKey: "deletedAt",
    header: "Deleted On",
    cell: ({ row }) => (
      <div>{format(row.original.deletedAt, "MMM d, yyyy")}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const comment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewComment(comment);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Info
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
