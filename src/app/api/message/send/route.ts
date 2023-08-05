import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export const POST = async (req: Request) => {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    // If no session then return Unauthorized
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const sessionUserId = session.user.id;
    const [userId1, userId2] = chatId.split("--");

    // If current session userId is not equal to any of the two userIds then return Unauthorized
    if (sessionUserId !== userId1 && sessionUserId !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const friendId = sessionUserId === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${sessionUserId}:friends`
    )) as string[];
    const isFriend = friendList.includes(friendId);

    // If the friendId is not the current users friend then return Unauthorized
    if (!isFriend) {
      return new Response("Unauthorized", { status: 401 });
    }

    const senderString = (await fetchRedis(
      "get",
      `user:${sessionUserId}`
    )) as string;
    const sender = JSON.parse(senderString) as User;

    // all valid, send the message
    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: sessionUserId,
      text,
      timestamp,
      receiverId: friendId,
    };
    const message = messageValidator.parse(messageData);

    // Notify all connected chat room clients
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming_message",
      message
    );

    // Everything is correct. Send the message
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
};
