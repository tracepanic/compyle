"use client";

import { columns } from "@/app/dashboard/comments/active-table";
import { columns as deletedColumns } from "@/app/dashboard/comments/deleted-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env/client";
import { queryClient } from "@/providers/query.provider";
import {
  deleteOwnComment,
  getUserCommentsDashboard,
  getUserDeletedCommentsDashboard,
} from "@/server/comment";
import { useMutation, useQueries } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

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

export default function Page() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeletedSheetOpen, setIsDeletedSheetOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<ActiveComment | null>(
    null,
  );
  const [selectedDeletedComment, setSelectedDeletedComment] =
    useState<DeletedComment | null>(null);

  const [activeResults, deletedResults] = useQueries({
    queries: [
      {
        queryKey: ["me-dashboard-comments-active"],
        queryFn: getUserCommentsDashboard,
        meta: { showError: true },
      },
      {
        queryKey: ["me-dashboard-comments-deleted"],
        queryFn: getUserDeletedCommentsDashboard,
        meta: { showError: true },
      },
    ],
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteOwnComment({ commentId }),
    onMutate: () => {
      setIsSheetOpen(false);
      return toast.loading("Deleting comment...");
    },
    onSuccess: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["me-dashboard-comments-active"],
      });
      queryClient.invalidateQueries({
        queryKey: ["me-dashboard-comments-deleted"],
      });
    },
    onError: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.error("Failed to delete comment.");
    },
  });

  const calculateDaysRemaining = (deletedAt: Date) => {
    const deletionDate = new Date(deletedAt);
    const expiryDate = new Date(deletionDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns: columns((comment) => {
      setSelectedComment(comment);
      setIsSheetOpen(true);
    }),
    data: activeResults.data ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  const deletedTable = useReactTable({
    columns: deletedColumns((comment) => {
      setSelectedDeletedComment(comment);
      setIsDeletedSheetOpen(true);
    }),
    data: deletedResults.data ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Your Comments</h1>

      <Tabs className="mt-6" defaultValue="active">
        <TabsList>
          <TabsTrigger className="cursor-pointer w-40" value="active">
            Active {activeResults.data && `(${activeResults.data.length})`}
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer w-40" value="deleted">
            Deleted {deletedResults.data && `(${deletedResults.data.length})`}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card className="mt-2 bg-background">
            <CardContent>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="font-semibold text-lg"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {activeResults.isPending ? (
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length}
                        className="min-h-32"
                      >
                        <div className="w-full mx-auto">
                          <Spinner className="mx-auto" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        className="cursor-pointer"
                        key={row.id}
                        onClick={() => {
                          setSelectedComment(row.original);
                          setIsSheetOpen(true);
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No comments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deleted">
          <Card className="mt-2 bg-background">
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  Deleted comments are retained for 30 days
                </AlertTitle>
                <AlertDescription>
                  Comments deleted by you or the app publisher are kept for 30
                  days to help resolve disputes such as spam allegations or
                  inappropriate content. After 30 days, they are permanently
                  removed from our system.
                </AlertDescription>
              </Alert>
              <Table>
                <TableHeader>
                  {deletedTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="font-semibold text-lg"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {deletedResults.isPending ? (
                    <TableRow>
                      <TableCell
                        colSpan={deletedTable.getAllColumns().length}
                        className="min-h-32"
                      >
                        <Spinner className="mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : deletedTable.getRowModel().rows.length ? (
                    deletedTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedDeletedComment(row.original);
                          setIsDeletedSheetOpen(true);
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={deletedTable.getAllColumns().length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No deleted comments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mt-10">
            <SheetTitle className="text-xl">Comment Details</SheetTitle>
            <SheetDescription>
              View detailed information about this comment
            </SheetDescription>
          </SheetHeader>

          {selectedComment && (
            <div className="mt-4 px-5 space-y-6">
              <div>
                <h3 className="mb-1">App Name</h3>
                <p className="text-sm text-muted-foreground pl-2">
                  {selectedComment.app.name}
                </p>
              </div>

              <div>
                <h3 className="mb-1">Comment</h3>
                <p className="text-sm text-muted-foreground pl-2">
                  {selectedComment.content}
                </p>
              </div>

              <div>
                <h3 className="mb-1">Created On</h3>
                <p className="text-sm text-muted-foreground pl-2">
                  {format(
                    selectedComment.createdAt,
                    "MMMM d, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>

              <div>
                <h3 className="mb-1">Last Updated</h3>
                <p className="text-sm text-muted-foreground pl-2">
                  {format(
                    selectedComment.updatedAt,
                    "MMMM d, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Link
                  href={`${env.NEXT_PUBLIC_BETTER_AUTH_URL}/apps/${selectedComment.app.slug}`}
                  target="_blank"
                  className={`${buttonVariants({ variant: "outline" })} w-full`}
                >
                  View App
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full cursor-pointer"
                    >
                      Delete Comment
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete this
                        comment?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-foreground hover:bg-destructive/90"
                        asChild
                      >
                        <Button
                          className="cursor-pointer"
                          variant="destructive"
                          onClick={() =>
                            deleteCommentMutation.mutate(selectedComment.id)
                          }
                        >
                          Delete Comment
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isDeletedSheetOpen} onOpenChange={setIsDeletedSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mt-10">
            <SheetTitle className="text-xl">Deleted Comment</SheetTitle>
            <SheetDescription>
              Details about this deleted comment
            </SheetDescription>
          </SheetHeader>

          {selectedDeletedComment && (
            <div className="mt-4 px-5 space-y-6">
              <div>
                <h3 className="mb-1">App Name</h3>
                <p className="text-sm text-muted-foreground pl-2">
                  {selectedDeletedComment.app.name}
                </p>
              </div>

              <div>
                <h3 className="mb-1">Comment</h3>
                <p className="text-sm text-muted-foreground pl-2">
                  {selectedDeletedComment.content}
                </p>
              </div>

              <div>
                <h3 className="mb-1">Deleted On</h3>
                <p className="text-sm text-muted-foreground pl-2">
                  {format(
                    selectedDeletedComment.deletedAt,
                    "MMMM d, yyyy 'at' h:mm a",
                  )}
                </p>
                <div className="flex items-center gap-2 ml-2 mt-1 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {calculateDaysRemaining(
                      selectedDeletedComment.deletedAt,
                    ) === 0
                      ? "Expires today"
                      : `${calculateDaysRemaining(selectedDeletedComment.deletedAt)} day${calculateDaysRemaining(selectedDeletedComment.deletedAt) === 1 ? "" : "s"} until permanent deletion`}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-1">Deleted By</h3>
                <Badge className="rounded-xs ml-2">
                  {selectedDeletedComment.deleter === "appOwner" && "APP OWNER"}
                  {selectedDeletedComment.deleter === "author" && "MYSELF"}
                </Badge>
              </div>

              {selectedDeletedComment.deleteReason && (
                <div>
                  <h3 className="mb-1">Delete Reason</h3>
                  <Badge
                    variant="destructive"
                    className="rounded-xs ml-2 uppercase"
                  >
                    {selectedDeletedComment.deleteReason}
                  </Badge>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <Link
                  href={`${env.NEXT_PUBLIC_BETTER_AUTH_URL}/apps/${selectedDeletedComment.app.slug}`}
                  target="_blank"
                  className={`${buttonVariants({ variant: "outline" })} w-full`}
                >
                  View App
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
