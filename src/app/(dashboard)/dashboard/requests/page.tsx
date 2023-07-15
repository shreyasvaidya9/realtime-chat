import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import FriendsWrapper from "@/components/FriendsWrapper";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import FriendRequests from "@/components/FriendRequests";

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return notFound();

  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;

      return {
        senderId,
        senderEmail: senderParsed.email,
        senderName: senderParsed.name,
        senderImage: senderParsed.image,
      };
    })
  );

  return (
    <FriendsWrapper>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </FriendsWrapper>
  );
};

export default Page;
