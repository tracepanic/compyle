import { AppDetailsClient } from "@/app/apps/[slug]/client";
import { getPublicAppSEODetails } from "@/server/app";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getPublicAppSEODetails({ slug });

    return {
      title: `${data.name} | Compyle Apps`,
      description: data.description,
      openGraph: {
        title: `${data.name} | Compyle Apps`,
        description: data.description,
        ...(data.image && { images: [{ url: data.image }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: `${data.name} | Compyle Apps`,
        description: data.description,
        ...(data.image && { images: [{ url: data.image }] }),
      },
    };
  } catch {
    return {
      title: "App Not Found",
      description: "This app does not exist",
      robots: { index: false },
    };
  }
}

export default async function AppDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <AppDetailsClient slug={slug} />
    </>
  );
}
