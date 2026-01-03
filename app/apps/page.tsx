"use client";

import { AppCard } from "@/components/custom/app-card";
import { AppCardSkeleton } from "@/components/custom/app-card-skeleton";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { getPublicApps } from "@/server/app";
import { useAuthStore } from "@/store/session.store";
import { AppCardProps } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AppWindow, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function Apps() {
  const { authInfo } = useAuthStore();

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["public-apps"],
      queryFn: ({ pageParam }) =>
        getPublicApps({ cursor: pageParam, limit: 15 }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      meta: { showError: true },
    });

  const allApps = data?.pages.flatMap((page) => page.apps) ?? [];
  const totalCount = allApps.length;

  return (
    <>
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <AppCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isPending && allApps.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AppWindow />
            </EmptyMedia>
            <EmptyTitle>No Apps Found</EmptyTitle>
            <EmptyDescription>
              You can be the first to submit an app
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {authInfo?.session ? (
              <Link href="/dashboard/apps/new">
                <Button className="cursor-pointer" variant="outline">
                  <PlusCircle />
                  Submit App
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="cursor-pointer" variant="outline">
                  <PlusCircle />
                  Login to Submit App
                </Button>
              </Link>
            )}
          </EmptyContent>
        </Empty>
      )}

      {!isPending && allApps.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allApps.map((app) => {
              const item: AppCardProps = {
                id: app.app.id,
                name: app.app.name,
                slug: app.app.slug,
                description: app.app.description,
                category: app.app.category,
                upvotes: app.upvoteCount,
                image: app.app.image || undefined,
              };
              return <AppCard key={item.id} app={item} />;
            })}
          </div>

          {hasNextPage && (
            <div className="mt-12 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                size="lg"
                className="cursor-pointer"
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner className="size-4" />
                    Loading more apps...
                  </>
                ) : (
                  "Load More Apps"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
