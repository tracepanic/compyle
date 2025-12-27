"use server";

import { db } from "@/db";
import { apps } from "@/db/schemas/app";
import { comments } from "@/db/schemas/comment";
import { users } from "@/db/schemas/user";
import { env } from "@/env/server";
import { createCommentSchema } from "@/schema/comment.schema";
import { getUserFromAuth } from "@/server/user";
import { and, desc, eq, isNotNull, isNull, lt } from "drizzle-orm";
import z, { ZodError } from "zod";

export async function addComment(
  appId: string,
  values: z.infer<typeof createCommentSchema>,
): Promise<boolean> {
  try {
    if (!appId) {
      throw new Error("Invalid app ID");
    }

    const data = createCommentSchema.parse(values);
    const user = await getUserFromAuth();

    await db.insert(comments).values({
      appId,
      userId: user.id,
      content: data.comment,
    });

    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid input data");
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to add comment");
  }
}

export async function deleteOwnComment({
  commentId,
}: {
  commentId: string;
}): Promise<boolean> {
  try {
    if (!commentId) {
      throw new Error("Invalid comment ID");
    }

    const user = await getUserFromAuth();

    const result = await db
      .update(comments)
      .set({
        deletedAt: new Date(),
        deleter: "author",
        deletedByUserId: user.id,
      })
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.userId, user.id),
          isNull(comments.deletedAt),
        ),
      )
      .returning({ id: comments.id });

    if (result.length === 0) {
      throw new Error("Comment not found or not owned by user");
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to delete comment");
  }
}

export async function deleteCommentAsAppOwner({
  commentId,
  reason,
}: {
  commentId: string;
  reason: string;
}): Promise<boolean> {
  try {
    if (!commentId) {
      throw new Error("Invalid comment ID");
    }

    if (!reason) {
      throw new Error("Deletion reason required");
    }

    const user = await getUserFromAuth();

    const result = await db
      .select({
        commentId: comments.id,
      })
      .from(comments)
      .innerJoin(apps, eq(comments.appId, apps.id))
      .where(
        and(
          eq(comments.id, commentId),
          eq(apps.userId, user.id),
          isNull(comments.deletedAt),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      throw new Error("Not authorized or comment not found");
    }

    await db
      .update(comments)
      .set({
        deletedAt: new Date(),
        deleter: "appOwner",
        deletedByUserId: user.id,
        deleteReason: reason,
      })
      .where(eq(comments.id, commentId));

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to delete comment");
  }
}

export async function getAppComments({
  appSlug,
  limit = 15,
  cursor,
}: {
  appSlug: string;
  limit?: number;
  cursor?: string; // The createdAt timestamp of the last comment
}): Promise<{
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string;
      image: string | null;
      username: string;
    };
  }>;
  nextCursor: string | null;
}> {
  try {
    if (!appSlug) {
      throw new Error("Invalid app slug");
    }

    // Build where conditions using join with apps table
    const whereConditions = cursor
      ? and(
          eq(apps.slug, appSlug),
          lt(comments.createdAt, new Date(cursor)),
          isNull(comments.deletedAt),
        )
      : and(eq(apps.slug, appSlug), isNull(comments.deletedAt));

    const appComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          image: users.image,
          username: users.username,
        },
      })
      .from(comments)
      .innerJoin(apps, eq(comments.appId, apps.id))
      .innerJoin(users, eq(comments.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(comments.createdAt))
      .limit(limit + 1); // Fetch one extra to determine if there are more

    // Check if there are more comments
    const hasMore = appComments.length > limit;
    const commentsToReturn = hasMore
      ? appComments.slice(0, limit)
      : appComments;

    // Use the last comment's createdAt as the next cursor
    const nextCursor = hasMore
      ? commentsToReturn[commentsToReturn.length - 1].createdAt.toISOString()
      : null;

    return {
      comments: commentsToReturn,
      nextCursor,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch comments");
  }
}

export async function getAppCommentsAdmin({
  appId,
  limit = 15,
  cursor,
}: {
  appId: string;
  limit?: number;
  cursor?: string;
}): Promise<{
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deleter: string | null;
    deleteReason: string | null;
    user: {
      id: string;
      name: string;
      image: string | null;
      username: string;
    };
  }>;
  nextCursor: string | null;
}> {
  try {
    if (!appId) {
      throw new Error("Invalid app ID");
    }

    const user = await getUserFromAuth();

    const whereConditions = cursor
      ? and(
          eq(comments.appId, appId),
          eq(apps.userId, user.id),
          lt(comments.createdAt, new Date(cursor)),
          isNull(comments.deletedAt),
        )
      : and(
          eq(comments.appId, appId),
          eq(apps.userId, user.id),
          isNull(comments.deletedAt),
        );

    const appComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        deletedAt: comments.deletedAt,
        deleter: comments.deleter,
        deleteReason: comments.deleteReason,
        user: {
          id: users.id,
          name: users.name,
          image: users.image,
          username: users.username,
        },
      })
      .from(comments)
      .innerJoin(apps, eq(comments.appId, apps.id))
      .innerJoin(users, eq(comments.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(comments.createdAt))
      .limit(limit + 1);

    // If no comments returned, either app doesn't exist or user doesn't own it
    if (appComments.length === 0) {
      // Check if it's an authorization issue or just no comments
      const appExists = await db
        .select({ id: apps.id })
        .from(apps)
        .where(and(eq(apps.id, appId), eq(apps.userId, user.id)))
        .limit(1);

      if (appExists.length === 0) {
        throw new Error("Not authorized or app not found");
      }
    }

    const hasMore = appComments.length > limit;
    const commentsToReturn = hasMore
      ? appComments.slice(0, limit)
      : appComments;

    const nextCursor = hasMore
      ? commentsToReturn[commentsToReturn.length - 1].createdAt.toISOString()
      : null;

    return {
      comments: commentsToReturn,
      nextCursor,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch admin comments");
  }
}

export async function getDeletedCommentsByAppOwner({
  appId,
  limit = 15,
  cursor,
}: {
  appId: string;
  limit?: number;
  cursor?: string;
}): Promise<{
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    deleteReason: string;
    user: {
      id: string;
      name: string;
      image: string | null;
      username: string;
    };
  }>;
  nextCursor: string | null;
}> {
  try {
    if (!appId) {
      throw new Error("Invalid app ID");
    }

    const user = await getUserFromAuth();

    // Verify user owns the app
    const appExists = await db
      .select({ id: apps.id })
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, user.id)))
      .limit(1);

    if (appExists.length === 0) {
      throw new Error("Not authorized or app not found");
    }

    // Build where conditions for deleted comments by app owner
    const whereConditions = cursor
      ? and(
          eq(comments.appId, appId),
          eq(comments.deleter, "appOwner"),
          lt(comments.deletedAt, new Date(cursor)),
        )
      : and(eq(comments.appId, appId), eq(comments.deleter, "appOwner"));

    const deletedComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        deletedAt: comments.deletedAt,
        deleteReason: comments.deleteReason,
        user: {
          id: users.id,
          name: users.name,
          image: users.image,
          username: users.username,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(comments.deletedAt)) // Order by deletion date
      .limit(limit + 1);

    const hasMore = deletedComments.length > limit;
    const commentsToReturn = hasMore
      ? deletedComments.slice(0, limit)
      : deletedComments;

    const nextCursor = hasMore
      ? commentsToReturn[commentsToReturn.length - 1].deletedAt!.toISOString()
      : null;

    return {
      comments: commentsToReturn.map((comment) => ({
        ...comment,
        deletedAt: comment.deletedAt!,
        deleteReason: comment.deleteReason!,
      })),
      nextCursor,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch deleted comments");
  }
}

export async function getUserCommentsDashboard(): Promise<
  Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    app: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
    };
  }>
> {
  try {
    const user = await getUserFromAuth();

    const userComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        app: {
          id: apps.id,
          name: apps.name,
          slug: apps.slug,
          image: apps.image,
        },
      })
      .from(comments)
      .innerJoin(apps, eq(comments.appId, apps.id))
      .where(and(eq(comments.userId, user.id), isNull(comments.deletedAt)))
      .orderBy(desc(comments.createdAt));

    return userComments;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch user comments");
  }
}

export async function getUserDeletedCommentsDashboard(): Promise<
  Array<{
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
  }>
> {
  try {
    const user = await getUserFromAuth();

    const deletedComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        deletedAt: comments.deletedAt,
        deleter: comments.deleter,
        deleteReason: comments.deleteReason,
        app: {
          id: apps.id,
          name: apps.name,
          slug: apps.slug,
          image: apps.image,
        },
        appOwner: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(comments)
      .innerJoin(apps, eq(comments.appId, apps.id))
      .innerJoin(users, eq(apps.userId, users.id))
      .where(and(eq(comments.userId, user.id), isNotNull(comments.deletedAt)))
      .orderBy(desc(comments.deletedAt));

    return deletedComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      deletedAt: comment.deletedAt!,
      deleter: comment.deleter as "author" | "appOwner",
      deleteReason: comment.deleteReason,
      app: {
        id: comment.app.id,
        name: comment.app.name,
        slug: comment.app.slug,
        image: comment.app.image,
        owner: {
          id: comment.appOwner.id,
          name: comment.appOwner.name,
          username: comment.appOwner.username,
        },
      },
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch deleted comments");
  }
}

export async function permanentlyDeleteOldComments(
  cronSecret: string,
): Promise<{
  success: boolean;
  count: number;
  message: string;
}> {
  try {
    const validSecret = env.CRON_SECRET;

    if (!validSecret) {
      throw new Error("CRON_SECRET not configured");
    }

    if (cronSecret !== validSecret) {
      throw new Error("Unauthorized: Invalid cron secret");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .delete(comments)
      .where(
        and(
          isNotNull(comments.deletedAt),
          isNotNull(comments.deleter),
          lt(comments.deletedAt, thirtyDaysAgo),
        ),
      )
      .returning({ id: comments.id });

    return {
      success: true,
      count: result.length,
      message: `Successfully deleted ${result.length} comments older than 30 days`,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to delete old comments");
  }
}
