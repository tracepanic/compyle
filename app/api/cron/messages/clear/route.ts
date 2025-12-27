import { permanentlyDeleteOldComments } from "@/server/comment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") ?? "";
    if (!userAgent.toLowerCase().includes("vercel-cron")) {
      return NextResponse.json(
        { error: "Forbidden: not a Vercel cron" },
        { status: 403 },
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    const result = await permanentlyDeleteOldComments(token);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job execution failed:", error);
    return NextResponse.json(
      { error: "Failed to execute cron job" },
      { status: 500 },
    );
  }
}
