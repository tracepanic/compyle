"use server";

import { db } from "@/db";
import { users } from "@/db/schemas/user";
import { auth } from "@/lib/auth";
import { User } from "better-auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getUserFromAuth(): Promise<User> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error("Unauthorized");
    }

    return session.user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Unauthorized");
  }
}

export async function getPublicUserProfile({
  username,
}: {
  username: string;
}): Promise<{
  name: string;
  about: string;
  image: string | null;
  username: string;
  createdAt: Date;
}> {
  try {
    if (!username) {
      throw new Error("Invalid username");
    }

    const res = await db
      .select({
        name: users.name,
        about: users.about,
        image: users.image,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username));

    if (res.length < 1) {
      throw new Error("No user found with the provided username");
    }

    return res[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch user profile");
  }
}

export async function getPublicUserSEO({
  username,
}: {
  username: string;
}): Promise<{
  name: string;
  about: string;
  image: string | null;
}> {
  try {
    if (!username) {
      throw new Error("Invalid username");
    }

    const res = await db
      .select({
        name: users.name,
        about: users.about,
        image: users.image,
      })
      .from(users)
      .where(eq(users.username, username));

    if (res.length < 1) {
      throw new Error("No user found with the provided username");
    }

    return res[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch user profile");
  }
}
