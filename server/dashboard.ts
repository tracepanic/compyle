"use server";

import { db } from "@/db";
import { apps } from "@/db/schemas/app";
import { comments } from "@/db/schemas/comment";
import { upvotes } from "@/db/schemas/upvote";
import { getUserFromAuth } from "@/server/user";
import { and, eq, isNull, sql } from "drizzle-orm";

export async function getDashboardStats(): Promise<{
  totalApps: number;
  appsGrowth: number;
  totalUpvotes: number;
  upvotesGrowth: number;
  totalViews: number;
  viewsGrowth: number;
  totalFollowers: number;
  followersGrowth: number;
  totalComments: number;
  commentsGrowth: number;
  upvotesOverTime: Array<{ month: string; upvotes: number }>;
  commentsOverTime: Array<{ month: string; comments: number }>;
}> {
  try {
    const user = await getUserFromAuth();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      appsStats,
      upvotesStats,
      commentsStats,
      upvotesOverTimeResult,
      commentsOverTimeResult,
    ] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          lastMonth: sql<number>`count(*) FILTER (WHERE ${apps.createdAt} >= ${thirtyDaysAgo})::int`,
          previousMonth: sql<number>`count(*) FILTER (WHERE ${apps.createdAt} >= ${sixtyDaysAgo} AND ${apps.createdAt} < ${thirtyDaysAgo})::int`,
        })
        .from(apps)
        .where(eq(apps.userId, user.id))
        .$withCache({
          config: { ex: 300 },
          tag: `dashboard:${user.id}:apps:stats`,
        }),

      db
        .select({
          total: sql<number>`count(*)::int`,
          lastMonth: sql<number>`count(*) FILTER (WHERE ${upvotes.createdAt} >= ${thirtyDaysAgo})::int`,
          previousMonth: sql<number>`count(*) FILTER (WHERE ${upvotes.createdAt} >= ${sixtyDaysAgo} AND ${upvotes.createdAt} < ${thirtyDaysAgo})::int`,
        })
        .from(upvotes)
        .innerJoin(apps, eq(apps.id, upvotes.appId))
        .where(eq(apps.userId, user.id))
        .$withCache({
          config: { ex: 300 },
          tag: `dashboard:${user.id}:upvotes:stats`,
        }),

      db
        .select({
          total: sql<number>`count(*)::int`,
          lastMonth: sql<number>`count(*) FILTER (WHERE ${comments.createdAt} >= ${thirtyDaysAgo})::int`,
          previousMonth: sql<number>`count(*) FILTER (WHERE ${comments.createdAt} >= ${sixtyDaysAgo} AND ${comments.createdAt} < ${thirtyDaysAgo})::int`,
        })
        .from(comments)
        .innerJoin(apps, eq(apps.id, comments.appId))
        .where(and(eq(apps.userId, user.id), isNull(comments.deletedAt)))
        .$withCache({
          config: { ex: 300 },
          tag: `dashboard:${user.id}:comments:stats`,
        }),

      db
        .select({
          year: sql<number>`EXTRACT(YEAR FROM ${upvotes.createdAt})::int`,
          month: sql<number>`EXTRACT(MONTH FROM ${upvotes.createdAt})::int`,
          upvotes: sql<number>`count(*)::int`,
        })
        .from(upvotes)
        .innerJoin(apps, eq(apps.id, upvotes.appId))
        .where(
          and(
            eq(apps.userId, user.id),
            sql`${upvotes.createdAt} >= NOW() - INTERVAL '6 months'`,
          ),
        )
        .groupBy(
          sql`EXTRACT(YEAR FROM ${upvotes.createdAt})`,
          sql`EXTRACT(MONTH FROM ${upvotes.createdAt})`,
        )
        .$withCache({
          config: { ex: 600 },
          tag: `dashboard:${user.id}:upvotes:timeline`,
        }),

      db
        .select({
          year: sql<number>`EXTRACT(YEAR FROM ${comments.createdAt})::int`,
          month: sql<number>`EXTRACT(MONTH FROM ${comments.createdAt})::int`,
          comments: sql<number>`count(*)::int`,
        })
        .from(comments)
        .innerJoin(apps, eq(apps.id, comments.appId))
        .where(
          and(
            eq(apps.userId, user.id),
            isNull(comments.deletedAt),
            sql`${comments.createdAt} >= NOW() - INTERVAL '6 months'`,
          ),
        )
        .groupBy(
          sql`EXTRACT(YEAR FROM ${comments.createdAt})`,
          sql`EXTRACT(MONTH FROM ${comments.createdAt})`,
        )
        .$withCache({
          config: { ex: 600 },
          tag: `dashboard:${user.id}:comments:timeline`,
        }),
    ]);

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const totalApps = appsStats[0]?.total || 0;
    const appsGrowth = calculateGrowth(
      appsStats[0]?.lastMonth || 0,
      appsStats[0]?.previousMonth || 0,
    );

    const totalUpvotes = upvotesStats[0]?.total || 0;
    const upvotesGrowth = calculateGrowth(
      upvotesStats[0]?.lastMonth || 0,
      upvotesStats[0]?.previousMonth || 0,
    );

    const totalComments = commentsStats[0]?.total || 0;
    const commentsGrowth = calculateGrowth(
      commentsStats[0]?.lastMonth || 0,
      commentsStats[0]?.previousMonth || 0,
    );

    const upvotesMap = new Map(
      upvotesOverTimeResult.map((item) => [
        `${item.year}-${item.month}`,
        item.upvotes,
      ]),
    );

    const commentsMap = new Map(
      commentsOverTimeResult.map((item) => [
        `${item.year}-${item.month}`,
        item.comments,
      ]),
    );

    const upvotesOverTime = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthName = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      return {
        month: monthName,
        upvotes: upvotesMap.get(key) || 0,
      };
    });

    const commentsOverTime = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthName = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      return {
        month: monthName,
        comments: commentsMap.get(key) || 0,
      };
    });

    return {
      totalApps,
      appsGrowth,
      totalUpvotes,
      upvotesGrowth,
      totalViews: 0,
      viewsGrowth: 0,
      totalFollowers: 0,
      followersGrowth: 0,
      totalComments,
      commentsGrowth,
      upvotesOverTime,
      commentsOverTime,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch dashboard stats");
  }
}
