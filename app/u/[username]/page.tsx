import AppDetailsClient from "@/app/u/[username]/client";
import { getPublicUserSEO } from "@/server/user";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  try {
    const data = await getPublicUserSEO({ username });

    return {
      title: `${data.name} | Compyle Apps`,
      description: data.about,
      openGraph: {
        title: `${data.name} | Compyle Apps`,
        description: data.about,
        ...(data.image && { images: [{ url: data.image }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: `${data.name} | Compyle Apps`,
        description: data.about,
        ...(data.image && { images: [{ url: data.image }] }),
      },
    };
  } catch {
    return {
      title: "User Not Found",
      description: "This user does not exist",
      robots: { index: false },
    };
  }
}

export default async function UserDetails({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <>
      <AppDetailsClient username={username} />
    </>
  );
}
