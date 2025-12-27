import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ellipsis, Eye } from "lucide-react";

type ActiveComment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  app: {
    id: string;
    name: string;
    slug: string;
  };
};

export const columns = (
  onViewComment: (comment: ActiveComment) => void,
): ColumnDef<ActiveComment>[] => [
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
    accessorKey: "createdAt",
    header: "Added On",
    cell: ({ row }) => {
      return <div>{format(row.original.createdAt, "MMM d, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const comment = row.original;

      return (
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
