CREATE TYPE "public"."ImageSource" AS ENUM('oauth', 'imagekit', 'custom', 'none');--> statement-breakpoint
ALTER TABLE "app" ADD COLUMN "imageSource" "ImageSource" DEFAULT 'imagekit' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "imageSource" "ImageSource" DEFAULT 'imagekit' NOT NULL;