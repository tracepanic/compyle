"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DELETE_COMMENT_REASON } from "@/data";
import { getInitials } from "@/lib/utils";
import { queryClient } from "@/providers/query.provider";
import {
  deleteCommentAsAppOwner,
  getAppCommentsAdmin,
  getDeletedCommentsByAppOwner,
} from "@/server/comment";
import { DeleteCommentReason } from "@/types";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare, Trash2, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function AppComments({ appId }: { appId: string }) {
  const [showError, setShowError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState<DeleteCommentReason | undefined>(
    undefined,
  );
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );

  // Active comments query
  const {
    data: activeData,
    isPending: isActivePending,
    isFetchingNextPage: isActiveFetchingNextPage,
    hasNextPage: hasActiveNextPage,
    fetchNextPage: fetchActiveNextPage,
  } = useInfiniteQuery({
    queryKey: ["app-comments-admin", appId],
    queryFn: ({ pageParam }) =>
      getAppCommentsAdmin({ appId, cursor: pageParam, limit: 15 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Deleted comments query
  const {
    data: deletedData,
    isPending: isDeletedPending,
    isFetchingNextPage: isDeletedFetchingNextPage,
    hasNextPage: hasDeletedNextPage,
    fetchNextPage: fetchDeletedNextPage,
  } = useInfiniteQuery({
    queryKey: ["app-comments-deleted", appId],
    queryFn: ({ pageParam }) =>
      getDeletedCommentsByAppOwner({ appId, cursor: pageParam, limit: 15 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const activeComments =
    activeData?.pages.flatMap((page) => page.comments) ?? [];
  const deletedComments =
    deletedData?.pages.flatMap((page) => page.comments) ?? [];

  const calculateDaysRemaining = (deletedAt: Date) => {
    const deletionDate = new Date(deletedAt);
    const expiryDate = new Date(deletionDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const deleteCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      reason,
    }: {
      commentId: string;
      reason: DeleteCommentReason;
    }) => deleteCommentAsAppOwner({ commentId, reason }),
    onMutate: () => {
      return toast.loading("Deleting comment...");
    },
    onSuccess: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["app-comments-admin", appId],
      });
      queryClient.invalidateQueries({
        queryKey: ["app-comments-deleted", appId],
      });
    },
    onError: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.error("Failed to delete comment.");
    },
  });

  const handleDeleteClick = (commentId: string) => {
    setSelectedCommentId(commentId);
    setReason(undefined);
    setShowError(false);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!reason) {
      setShowError(true);
      return;
    }

    if (selectedCommentId) {
      deleteCommentMutation.mutate({
        commentId: selectedCommentId,
        reason,
      });
      setIsDialogOpen(false);
      setSelectedCommentId(null);
      setReason(undefined);
      setShowError(false);
    }
  };

  const handleReasonChange = (value: DeleteCommentReason) => {
    setReason(value);
    setShowError(false);
  };

  return (
    <div>
      <h2 className="mb-3 text-2xl font-bold text-foreground">Comments</h2>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">
            Active ({activeComments.length})
          </TabsTrigger>
          <TabsTrigger value="deleted">
            Deleted ({deletedComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isActivePending && !isActiveFetchingNextPage && (
            <div>
              <Spinner className="mx-auto size-6" />
            </div>
          )}

          {!isActivePending && activeComments.length < 1 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquare />
                </EmptyMedia>
                <EmptyTitle>No Comments Found</EmptyTitle>
                <EmptyDescription>
                  No comments have been posted on this app yet
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          <div className="space-y-4">
            {activeComments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-border pb-1 last:border-b-0"
              >
                <div className="flex gap-4">
                  <Link href={`/u/${comment.user.username}`}>
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={comment.user.image || undefined} />
                      <AvatarFallback>
                        {getInitials(comment.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Link
                        href={`/u/${comment.user.username}`}
                        className="font-semibold text-foreground"
                      >
                        {comment.user.name}
                      </Link>
                      <div className="flex gap-3 items-center">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, yyyy")}
                        </span>
                        <button
                          onClick={() => handleDeleteClick(comment.id)}
                          className="cursor-pointer"
                        >
                          <Trash2 className="text-destructive size-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-foreground/75 text-pretty">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasActiveNextPage && (
            <Button
              onClick={() => fetchActiveNextPage()}
              disabled={isActiveFetchingNextPage}
              variant="outline"
              className="w-full mt-4 cursor-pointer"
            >
              {isActiveFetchingNextPage ? (
                <>
                  <Spinner className="size-4" />
                  Loading more...
                </>
              ) : (
                "Load More Comments"
              )}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="deleted">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Deleted comments are retained for 30 days</AlertTitle>
            <AlertDescription>
              Comments you delete are kept for 30 days to help resolve disputes
              such as spam allegations or inappropriate content. After 30 days,
              they are permanently removed from our system.
            </AlertDescription>
          </Alert>

          {isDeletedPending && !isDeletedFetchingNextPage && (
            <div>
              <Spinner className="mx-auto size-6" />
            </div>
          )}

          {!isDeletedPending && deletedComments.length < 1 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Trash2 />
                </EmptyMedia>
                <EmptyTitle>No Deleted Comments</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t deleted any comments yet
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          <div className="space-y-2">
            {deletedComments.map((comment) => {
              const daysRemaining = calculateDaysRemaining(comment.deletedAt);

              return (
                <div
                  key={comment.id}
                  className="border-b border-border pb-4 last:border-b-0 opacity-70"
                >
                  <div className="flex gap-4">
                    <Link href={`/u/${comment.user.username}`}>
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={comment.user.image || undefined} />
                        <AvatarFallback>
                          {getInitials(comment.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Link
                          href={`/u/${comment.user.username}`}
                          className="font-semibold text-foreground"
                        >
                          {comment.user.name}
                        </Link>
                        <div className="flex gap-3 items-center">
                          <span className="text-xs text-muted-foreground">
                            Deleted{" "}
                            {format(new Date(comment.deletedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <p className="mb-2 text-sm text-foreground/75 text-pretty">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                          {comment.deleteReason}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysRemaining === 0
                            ? "Expires today"
                            : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} until permanent deletion`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasDeletedNextPage && (
            <Button
              onClick={() => fetchDeletedNextPage()}
              disabled={isDeletedFetchingNextPage}
              variant="outline"
              className="w-full mt-4 cursor-pointer"
            >
              {isDeletedFetchingNextPage ? (
                <>
                  <Spinner className="size-4" />
                  Loading more...
                </>
              ) : (
                "Load More Comments"
              )}
            </Button>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this comment?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Delete Reason
            </label>
            <Select value={reason} onValueChange={handleReasonChange}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DELETE_COMMENT_REASON.map((reason) => (
                  <SelectItem
                    key={reason}
                    className="cursor-pointer"
                    value={reason}
                  >
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showError && (
              <p className="text-sm text-destructive mt-2">
                Please select a reason before deleting
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDeleteConfirm}
              className="cursor-pointer bg-destructive text-foreground hover:bg-destructive/90"
              variant="destructive"
            >
              Delete Comment
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
