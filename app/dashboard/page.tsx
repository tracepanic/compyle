"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardStats } from "@/server/dashboard";
import { useAuthStore } from "@/store/session.store";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  Heart,
  MessageSquare,
  Plus,
  Rocket,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const upvoteChartConfig = {
  upvotes: {
    label: "Upvotes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const commentChartConfig = {
  comments: {
    label: "Comments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function GrowthIndicator({ growth }: { growth: number }) {
  const isPositive = growth >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-green-500" : "text-destructive";

  return (
    <p className={`text-xs flex items-center gap-1 ${colorClass}`}>
      <Icon className="size-3" />
      {isPositive ? "+" : ""}
      {growth}% from last month
    </p>
  );
}

export default function Page() {
  const { authInfo } = useAuthStore();

  const { isPending, data } = useQuery({
    queryKey: ["me-dashboard-stats"],
    queryFn: getDashboardStats,
    meta: { showError: true },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const upvoteData = data?.upvotesOverTime || [];
  const commentData = data?.commentsOverTime || [];

  return (
    <div className="space-y-6">
      {authInfo?.user?.emailVerified !== true && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Your email address has not been verified.</AlertTitle>
          <AlertDescription className="inline">
            Please click{" "}
            <Link href="/verify-email" className="text-primary underline">
              here
            </Link>{" "}
            to verify your email and avoid getting restricted on some actions
            across the app
          </AlertDescription>
        </Alert>
      )}

      {isPending && (
        <div className="flex justify-center py-8">
          <Spinner className="size-6" />
        </div>
      )}

      {!isPending && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Apps
                </CardTitle>
                <Rocket className="text-foreground/50 size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalApps}</div>
                <GrowthIndicator growth={data.appsGrowth} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Upvotes
                </CardTitle>
                <Heart className="text-foreground/50 size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalUpvotes}</div>
                <GrowthIndicator growth={data.upvotesGrowth} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Comments
                </CardTitle>
                <MessageSquare className="text-foreground/50 size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalComments}</div>
                <GrowthIndicator growth={data.commentsGrowth} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
                <Users className="text-foreground/50 size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalFollowers}</div>
                <GrowthIndicator growth={data.followersGrowth} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 min-w-0">
              <CardHeader>
                <CardTitle className="text-lg">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Tabs defaultValue="upvotes">
                  <TabsList>
                    <TabsTrigger value="upvotes" className="cursor-pointer">
                      Upvotes
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="cursor-pointer">
                      Comments
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upvotes" className="mt-10">
                    <ChartContainer
                      config={upvoteChartConfig}
                      className="h-52 w-full min-w-72"
                    >
                      <BarChart accessibilityLayer data={upvoteData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.slice(0, 3)}
                          fontSize={12}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={12}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="upvotes"
                          fill="var(--chart-4)"
                          radius={4}
                        />
                      </BarChart>
                    </ChartContainer>
                  </TabsContent>

                  <TabsContent value="comments" className="mt-10">
                    <ChartContainer
                      config={commentChartConfig}
                      className="h-52 w-full min-w-72"
                    >
                      <BarChart accessibilityLayer data={commentData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.slice(0, 3)}
                          fontSize={12}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={12}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="comments"
                          fill="var(--chart-4)"
                          radius={4}
                        />
                      </BarChart>
                    </ChartContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/dashboard/apps/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit New App
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
