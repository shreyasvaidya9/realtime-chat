import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // If user is not logged in, then return unauthorized request
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const sessionUserId = session.user.id;

    const body = await req.json();
    const { id: idToDeny } = z.object({ id: z.string() }).parse(body);

    await db.srem(`user:${sessionUserId}:incoming_friend_requests`, idToDeny);
    // await db.srem(`user:${idToDeny}:outbound_friend_requests`, sessionUserId);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid Request Payload", {
        status: 422,
      });
    }

    return new Response("Invalid Request", { status: 400 });
  }
}
