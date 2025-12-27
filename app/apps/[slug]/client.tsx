"use client";

import { AppComments } from "@/app/apps/[slug]/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getInitials } from "@/lib/utils";
import { queryClient } from "@/providers/query.provider";
import { getPublicAppDetails } from "@/server/app";
import { checkUserUpvote, toggleUpvote } from "@/server/upvote";
import { useAuthStore } from "@/store/session.store";
import { useMutation, useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AppWindow,
  ExternalLink,
  Github,
  Globe,
  Heart,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export function AppDetailsClient({ slug }: { slug: string }) {
  const { authInfo, isInitialPending } = useAuthStore();

  const results = useQueries({
    queries: [
      {
        queryKey: ["public-app", slug],
        queryFn: () => getPublicAppDetails({ slug }),
        meta: { showError: true },
      },
      {
        queryKey: ["upvote-status", slug],
        queryFn: () => checkUserUpvote({ appSlug: slug }),
        enabled: !isInitialPending && !!authInfo && !!authInfo.session,
      },
    ],
  });

  const [appResult, upvoteResult] = results;

  const app = appResult.data ?? null;
  const upvoteStatus = upvoteResult.data ?? { hasUpvoted: false };
  const isUpvoteLoading = authInfo?.session ? upvoteResult.isPending : false;

  const upvoteMutation = useMutation({
    mutationFn: () => toggleUpvote({ appSlug: slug }),
    onError: () => {
      toast.error("Failed to upvote. Please try again");
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["public-app", slug] });
        queryClient.invalidateQueries({ queryKey: ["upvote-status", slug] });

        if (result.action === "added") {
          toast.success("Upvoted successfully!");
        } else {
          toast.success("Upvote removed");
        }
      } else {
        toast.error("Failed to upvote. Please try again");
      }
    },
  });

  const handleUpvote = () => {
    upvoteMutation.mutate();
  };

  const hasAnyLinks =
    app &&
    (app.appDetails.demoUrl ||
      app.appDetails.websiteUrl ||
      app.appDetails.repoUrl);

  return (
    <>
      {appResult.isPending && (
        <div>
          <Spinner className="mx-auto size-6" />
        </div>
      )}

      {!appResult.isPending && !app && (
        <Empty className="border mx-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AppWindow />
            </EmptyMedia>
            <EmptyTitle>App Not Found</EmptyTitle>
            <EmptyDescription>
              App with that slug not found. Either it doesn&apos;t exist or
              hasn&apos;t been published yet. You can continue by submitting
              your own app or viewing other apps.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
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
              <Link href="/apps">
                <Button className="cursor-pointer" variant="outline">
                  View All Apps
                </Button>
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      )}

      {!appResult.isPending && app && (
        <div className="md:px-16">
          {/* Hero Image */}
          <div className="w-full h-48 sm:h-64 md:h-96 rounded-lg mb-4 md:mb-6 overflow-hidden border relative">
            {app.appDetails.image ? (
              <Image
                src={app.appDetails.image}
                alt={`${app.appDetails.name} cover image`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/30 via-secondary/20 to-accent/30" />
            )}
          </div>

          {/* Mobile-First Layout */}
          <div className="space-y-6 lg:hidden">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {app.appDetails.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {app.appDetails.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-xs">{app.appDetails.category}</Badge>
              {app.appDetails.builtWith.map((tech) => (
                <Badge key={tech} variant="secondary" className="rounded-xs">
                  {tech}
                </Badge>
              ))}
            </div>

            {/* Upvote Card - Prominent on Mobile */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground tracking-tighter">
                    {app.upvoteCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">upvotes</p>
                </div>
                {authInfo?.session ? (
                  <Button
                    disabled={isUpvoteLoading || upvoteMutation.isPending}
                    className="flex-1 cursor-pointer"
                    onClick={handleUpvote}
                  >
                    {isUpvoteLoading ? (
                      <>
                        <Spinner className="size-4" />
                        Loading...
                      </>
                    ) : upvoteMutation.isPending ? (
                      "Updating..."
                    ) : upvoteStatus.hasUpvoted ? (
                      <>
                        <Heart className="h-5 w-5 fill-current" />
                        Upvoted
                      </>
                    ) : (
                      <>
                        <Heart className="h-5 w-5" />
                        Upvote
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href="/login" className="flex-1">
                    <Button className="w-full cursor-pointer">
                      <Heart className="h-5 w-5" />
                      Login to Upvote
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Action Links */}
            {hasAnyLinks && (
              <div className="flex flex-col sm:flex-row gap-2">
                {app.appDetails.demoUrl && (
                  <Link
                    className={buttonVariants({
                      size: "default",
                      className: "flex-1",
                    })}
                    href={app.appDetails.demoUrl}
                    target="_blank"
                  >
                    <Globe className="h-4 w-4" />
                    View Demo
                  </Link>
                )}
                {app.appDetails.websiteUrl && (
                  <Link
                    className={buttonVariants({
                      size: "default",
                      variant: "outline",
                      className: "flex-1",
                    })}
                    href={app.appDetails.websiteUrl}
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Site
                  </Link>
                )}
                {app.appDetails.repoUrl && (
                  <Link
                    className={buttonVariants({
                      size: "default",
                      variant: "outline",
                      className: "flex-1",
                    })}
                    href={app.appDetails.repoUrl}
                    target="_blank"
                  >
                    <Github className="h-4 w-4" />
                    Source Code
                  </Link>
                )}
              </div>
            )}

            {/* Creator Info - Compact on Mobile */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={app.userDetails.image || undefined} />
                  <AvatarFallback>
                    {getInitials(app.userDetails.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Created by
                  </p>
                  <h3 className="font-semibold text-foreground truncate">
                    {app.userDetails.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    u/{app.userDetails.username}
                  </p>
                </div>
                <Link href={`/u/${app.userDetails.username}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    View
                  </Button>
                </Link>
              </div>
            </div>

            {/* App Details */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Details
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-foreground capitalize">
                    {app.appDetails.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-semibold text-foreground">
                    {format(new Date(app.appDetails.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <AppComments slug={slug} id={app.appDetails.id} />
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid gap-9 lg:grid-cols-6 mt-10">
            <div className="lg:col-span-4 space-y-8">
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                      {app.appDetails.name}
                    </h1>
                    <p className="mt-2 text-base text-muted-foreground">
                      {app.appDetails.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-xs">
                    {app.appDetails.category}
                  </Badge>
                  {app.appDetails.builtWith.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="rounded-xs"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {hasAnyLinks && (
                <div className="flex flex-wrap gap-3 border-t border-b border-border py-6">
                  {app.appDetails.demoUrl && (
                    <Link
                      className={buttonVariants({ size: "sm" })}
                      href={app.appDetails.demoUrl}
                      target="_blank"
                    >
                      <Globe className="h-4 w-4" />
                      View Demo
                    </Link>
                  )}
                  {app.appDetails.websiteUrl && (
                    <Link
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={app.appDetails.websiteUrl}
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Site
                    </Link>
                  )}
                  {app.appDetails.repoUrl && (
                    <Link
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={app.appDetails.repoUrl}
                      target="_blank"
                    >
                      <Github className="h-4 w-4" />
                      Source Code
                    </Link>
                  )}
                </div>
              )}

              {!hasAnyLinks && <Separator />}

              <AppComments slug={slug} id={app.appDetails.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-7 lg:col-span-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {app.upvoteCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">upvotes</p>
                </div>
                {authInfo?.session ? (
                  <Button
                    disabled={isUpvoteLoading || upvoteMutation.isPending}
                    className="w-full cursor-pointer"
                    onClick={handleUpvote}
                  >
                    {isUpvoteLoading ? (
                      <>
                        <Spinner className="size-4" />
                        Loading...
                      </>
                    ) : upvoteMutation.isPending ? (
                      "Updating..."
                    ) : upvoteStatus.hasUpvoted ? (
                      <>
                        <Heart className="h-5 w-5 fill-current" />
                        Upvoted
                      </>
                    ) : (
                      <>
                        <Heart className="h-5 w-5" />
                        Upvote
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href="/login" className="w-full">
                    <Button className="w-full cursor-pointer">
                      <Heart className="h-5 w-5" />
                      Login to Upvote
                    </Button>
                  </Link>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <p className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Created by
                </p>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="mb-3 h-16 w-16">
                    <AvatarImage src={app.userDetails.image || undefined} />
                    <AvatarFallback>
                      {getInitials(app.userDetails.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-foreground text-lg">
                    {app.userDetails.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    u/{app.userDetails.username}
                  </p>
                  <Link
                    href={`/u/${app.userDetails.username}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full cursor-pointer"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>

              {/* App Stats */}
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Details
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-foreground capitalize">
                      {app.appDetails.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted</span>
                    <span className="font-semibold text-foreground">
                      {format(
                        new Date(app.appDetails.createdAt),
                        "MMM d, yyyy",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
