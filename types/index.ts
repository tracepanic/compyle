import { DELETE_COMMENT_REASON } from "@/data";
import { Session, User } from "better-auth";

export type AppCardProps = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  upvotes: number;
  image?: string;
};

export type ImageData = {
  image: string;
  imageProviderFileId?: string;
  imageSource: "oauth" | "imagekit" | "custom" | "none";
};

export type AuthInfo = {
  user: User;
  session: Session;
};

export type DeleteCommentReason = (typeof DELETE_COMMENT_REASON)[number];
