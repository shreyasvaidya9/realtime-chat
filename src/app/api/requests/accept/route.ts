import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // If user is not logged in, then return unauthorized request
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const sessionUserId = session.user.id;

    const body = await req.json();
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    // Verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${sessionUserId}:friends`,
      idToAdd
    );

    if (isAlreadyFriends) {
      return new Response("Already Friends", { status: 400 });
    }

    // Check if the user to add is present in the incoming friend requests
    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${sessionUserId}:incoming_friend_requests`,
      idToAdd
    );

    if (!hasFriendRequest) {
      return new Response("No Friend Request", {
        status: 400,
      });
    }

    const [userResponse, friendResponse] = (await Promise.all([
      fetchRedis("get", `user:${sessionUserId}`),
      fetchRedis("get", `user:${idToAdd}`),
    ])) as [string, string];

    const user = JSON.parse(userResponse) as User;
    const friend = JSON.parse(friendResponse) as User;

    /**
     * * First two elements: pusher triggers which notify both friends when added
     * * Next two elements: Add the users as friends of each other in db
     * * Remove the incoming friends requests from the current user
     * * Future: await db.srem(`user:${idToAdd}:outbound_friend_requests`, sessionUserId);
     */
    await Promise.all([
      await pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        "new_friend",
        user
      ),
      await pusherServer.trigger(
        toPusherKey(`user:${sessionUserId}:friends`),
        "new_friend",
        friend
      ),
      await db.sadd(`user:${sessionUserId}:friends`, idToAdd),
      await db.sadd(`user:${idToAdd}:friends`, sessionUserId),
      await db.srem(`user:${sessionUserId}:incoming_friend_requests`, idToAdd),
    ]);

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
