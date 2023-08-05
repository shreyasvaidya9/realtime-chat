"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { X } from "lucide-react";
import { Check, UserPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useState, useEffect } from "react";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequests[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<
    IncomingFriendRequests[]
  >(incomingFriendRequests);

  useEffect(() => {
    const incomingFriendRequestsPusherKey = toPusherKey(
      `user:${sessionId}:incoming_friend_requests`
    );
    const incomingFriendRequests = "incoming_friend_requests";

    const friendRequestHandler = ({
      senderId,
      senderEmail,
      senderName,
      senderImage,
    }: IncomingFriendRequests) => {
      setFriendRequests((prev) => [
        ...prev,
        { senderId, senderEmail, senderName, senderImage },
      ]);
    };

    pusherClient.subscribe(incomingFriendRequestsPusherKey);
    pusherClient.bind(incomingFriendRequests, friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(incomingFriendRequestsPusherKey);
      pusherClient.unbind(incomingFriendRequests, friendRequestHandler);
    };
  }, [sessionId]);

  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/requests/accept", { id: senderId });

    setFriendRequests((prevRequests) =>
      prevRequests.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post("/api/requests/deny", { id: senderId });

    setFriendRequests((prevRequests) =>
      prevRequests.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            {request.senderImage ? (
              <div>
                <Image
                  width={48}
                  height={48}
                  alt={request.senderName ?? "Image"}
                  className="rounded-full"
                  src={request.senderImage}
                />
              </div>
            ) : (
              <div>
                <UserPlus className="text-black w-12 h-12" />
              </div>
            )}

            <div>
              <p className="font-medium text-lg">{request.senderName}</p>
              <p className="font-medium text-sm text-zinc-400">
                {request.senderEmail}
              </p>
            </div>
            <button
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => acceptFriend(request.senderId)}
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => denyFriend(request.senderId)}
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
