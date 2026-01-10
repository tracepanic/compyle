"use client";

import { Badge } from "@/components/ui/badge";
import { AppCardProps } from "@/types";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function AppCard({ app }: { app: AppCardProps }) {
  return (
    <Link href={`/apps/${app.slug}`}>
      <div className="h-full p-6 rounded-lg bg-card border border-border transition-all hover:shadow-md hover:shadow-primary/10 group cursor-pointer">
        <div className="w-full h-40 rounded-lg mb-4 overflow-hidden border relative">
          {app.image ? (
            <Image
              src={app.image}
              alt={`${app.name || "App"} cover image`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/30 via-secondary/20 to-accent/30 group-hover:from-primary/40 group-hover:via-secondary/30 group-hover:to-accent/40 transition-all" />
          )}
        </div>

        <div className="mb-3">
          <Badge
            variant="outline"
            className="rounded-xs uppercase text-primary"
          >
            {app.category}
          </Badge>
        </div>

        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors truncate">
          {app.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {app.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1"></div>
          <div className="flex items-center gap-1 text-muted-foreground"></div>
          <div className="flex gap-5">
            <p className="text-foreground/50">upvotes</p>
            <Heart className="text-destructive fill-destructive size-5 mt-0.5 -mr-3" />
            <p className="text-foreground/50">{app.upvotes}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
