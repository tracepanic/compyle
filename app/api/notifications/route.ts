import { notificationEvents } from "@/lib/notification.service";
import { auth } from "@/lib/auth"; // Assuming auth setup is here or similar
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const eventName = `notification:${userId}`;
      notificationEvents.on(eventName, sendEvent);

      // Keep connection alive with a comment occasionally if needed
      // controller.enqueue(encoder.encode(": keepalive\n\n"));

      req.signal.addEventListener("abort", () => {
        notificationEvents.off(eventName, sendEvent);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
