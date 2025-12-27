"use client";

import { AppComments } from "@/app/dashboard/apps/[id]/comments";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { deleteApp, getDashboardAppDetails } from "@/server/app";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Check,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Github,
  Globe,
  Heart,
  MessageCircle,
  MonitorPlay,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AppDetailsDashboard({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  const { isPending, data } = useQuery({
    queryKey: ["dashboard-app", id],
    queryFn: () => getDashboardAppDetails({ id }),
    meta: { showError: true },
  });

  const deleteAppMutation = useMutation({
    mutationFn: (appId: string) => deleteApp({ appId }),
    onMutate: () => {
      return toast.loading("Deleting app...");
    },
    onSuccess: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.success("App deleted successfully");
      router.push("/dashboard/apps");
    },
    onError: (_, __, toastId) => {
      toast.dismiss(toastId);
      toast.error("Failed to delete app.");
    },
  });

  const handleDelete = async () => {
    deleteAppMutation.mutate(data?.appDetails.id || "");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data!.appDetails.slug);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {}
  };

  return (
    <div className="pb-12">
      {isPending && (
        <div className="mt-4">
          <Spinner className="mx-auto size-6" />
        </div>
      )}

      {!isPending && !data && (
        <Empty className="border max-w-4xl mx-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>App Not Found</EmptyTitle>
            <EmptyDescription>
              App with that ID not found. You can continue by submitting your
              own app or viewing other apps.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Link href="/dashboard/apps/new">
                <Button className="cursor-pointer">Submit App</Button>
              </Link>
              <Link href="/dashboard/apps">
                <Button className="cursor-pointer" variant="outline">
                  View All Apps
                </Button>
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      )}

      {!isPending && data && (
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {data.appDetails.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-2 flex">
              <span className="pr-2">{data.appDetails.slug}</span>
              {copied ? (
                <Check className="size-3 mt-1" />
              ) : (
                <Copy
                  onClick={handleCopy}
                  className="size-3 mt-1 cursor-pointer"
                />
              )}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upvotes</CardTitle>
                  <Heart className="text-foreground/50 size-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.upvoteCount}</div>
                  <p className="text-muted-foreground text-xs">
                    +0% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Comments
                  </CardTitle>
                  <MessageCircle className="text-foreground/50 size-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-muted-foreground text-xs">
                    +0% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Views</CardTitle>
                  <Eye className="text-foreground/50 size-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-muted-foreground text-xs">
                    +0% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Clock className="text-foreground/50 size-5" />
                </CardHeader>
                <CardContent className="mt-auto">
                  {data.appDetails.status === "draft" && (
                    <Badge className="rounded-xs" variant="outline">
                      DRAFT
                    </Badge>
                  )}
                  {data.appDetails.status === "published" && (
                    <Badge className="rounded-xs">PUBLISHED</Badge>
                  )}
                  {data.appDetails.status === "archived" && (
                    <Badge className="rounded-xs" variant="destructive">
                      ARCHIVED
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile-First Layout */}
          <div className="space-y-6 lg:hidden mt-5">
            {/* Cover Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              {data.appDetails.image ? (
                <Image
                  src={data.appDetails.image}
                  alt={`${data.appDetails.name} cover image`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/30 via-secondary/20 to-accent/30" />
              )}
            </div>

            {/* Quick Actions - Prominent on Mobile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  className={`${buttonVariants({ variant: "outline", size: "default" })} w-full`}
                  href={`/apps/${data.appDetails.slug}`}
                >
                  <Eye />
                  View Public Page
                </Link>
                <Link
                  className={`${buttonVariants({ variant: "outline", size: "default" })} w-full`}
                  href={`/dashboard/apps/edit/${data.appDetails.id}`}
                >
                  <Edit />
                  Edit App Details
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full gap-2 cursor-pointer"
                      size="default"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete App
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete {data.appDetails.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this app and all associated
                        data including comments and likes. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive cursor-pointer text-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <p className="font-semibold text-sm mb-2">DESCRIPTION</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.appDetails.description}
              </p>
            </div>

            {/* App Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">App Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.appDetails.websiteUrl ? (
                  <Link
                    href={data.appDetails.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Website
                      </p>
                      <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                        {data.appDetails.websiteUrl.replace(/^https?:\/\//, "")}
                      </p>
                    </div>

                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 cursor-not-allowed">
                    <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Website
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        Not provided
                      </p>
                    </div>
                  </div>
                )}

                {data.appDetails.repoUrl ? (
                  <Link
                    href={data.appDetails.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                      <Github className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Repository
                      </p>
                      <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                        {data.appDetails.repoUrl.replace(/^https?:\/\//, "")}
                      </p>
                    </div>

                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 cursor-not-allowed">
                    <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                      <Github className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Repository
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        Not provided
                      </p>
                    </div>
                  </div>
                )}

                {data.appDetails.demoUrl ? (
                  <Link
                    href={data.appDetails.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                      <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Live Demo
                      </p>
                      <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                        {data.appDetails.demoUrl.replace(/^https?:\/\//, "")}
                      </p>
                    </div>

                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 cursor-not-allowed">
                    <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                      <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Live Demo
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        Not provided
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <div>
              <p className="font-semibold text-sm mb-3">TAGS</p>
              <div className="flex flex-wrap gap-2">
                {data.appDetails.builtWith.map((tech) => (
                  <Badge key={tech} variant="secondary" className="rounded-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* App Metadata */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">App Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">CATEGORY</p>
                  <Badge className="rounded-xs">
                    {data.appDetails.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    CREATED AT
                  </p>
                  <p className="text-sm">
                    {format(new Date(data.appDetails.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    LAST UPDATED
                  </p>
                  <p className="text-sm">
                    {format(new Date(data.appDetails.updatedAt), "MMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            {data.appDetails && (
              <div className="pt-4">
                <AppComments appId={id} />
              </div>
            )}
          </div>

          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-6 gap-9">
            <div className="lg:col-span-4 space-y-6">
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                {data.appDetails.image ? (
                  <Image
                    src={data.appDetails.image}
                    alt={`${data.appDetails.name} cover image`}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/30 via-secondary/20 to-accent/30" />
                )}
              </div>
              <div>
                <p className="font-semibold">DESCRIPTION</p>
                <p className="mt-2 pl-2 text-base text-muted-foreground">
                  {data.appDetails.description}
                </p>
              </div>
              <div>
                <p className="font-semibold">TAGS</p>
                <div className="flex flex-wrap gap-2 mt-4 pl-2">
                  {data.appDetails.builtWith.map((tech) => (
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

              {data.appDetails && (
                <div className="mt-20">
                  <AppComments appId={id} />
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link
                    className={`${buttonVariants({ variant: "outline" })} w-full`}
                    href={`/apps/${data.appDetails.slug}`}
                  >
                    <Eye />
                    View Public Page
                  </Link>
                  <Link
                    className={`${buttonVariants({ variant: "outline" })} w-full`}
                    href={`/dashboard/apps/edit/${data.appDetails.id}`}
                  >
                    <Edit />
                    Edit App Details
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full gap-2 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete App
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete {data.appDetails.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this app and all
                          associated data including comments and likes. This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive cursor-pointer text-foreground hover:bg-destructive/90"
                          onClick={handleDelete}
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>App Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.appDetails.websiteUrl ? (
                    <Link
                      href={data.appDetails.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Website
                        </p>
                        <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {data.appDetails.websiteUrl.replace(
                            /^https?:\/\//,
                            "",
                          )}
                        </p>
                      </div>

                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 cursor-not-allowed">
                      <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Website
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Not provided
                        </p>
                      </div>
                    </div>
                  )}

                  {data.appDetails.repoUrl ? (
                    <Link
                      href={data.appDetails.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center">
                        <Github className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Repository
                        </p>
                        <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {data.appDetails.repoUrl.replace(/^https?:\/\//, "")}
                        </p>
                      </div>

                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 cursor-not-allowed">
                      <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center">
                        <Github className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Repository
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Not provided
                        </p>
                      </div>
                    </div>
                  )}

                  {data.appDetails.demoUrl ? (
                    <Link
                      href={data.appDetails.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center">
                        <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Live Demo
                        </p>
                        <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {data.appDetails.demoUrl.replace(/^https?:\/\//, "")}
                        </p>
                      </div>

                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 cursor-not-allowed">
                      <div className="h-9 w-9 rounded-lg bg-background/50 flex items-center justify-center">
                        <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          Live Demo
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Not provided
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>App Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">CATEGORY</p>
                    <Badge className="rounded-xs ml-4 mt-1">
                      {data.appDetails.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CREATED AT</p>
                    <p className="ml-4">
                      {format(
                        new Date(data.appDetails.createdAt),
                        "MMM d, yyyy",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      LAST UPDATED
                    </p>
                    <p className="ml-4">
                      {format(
                        new Date(data.appDetails.updatedAt),
                        "MMM d, yyyy",
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
