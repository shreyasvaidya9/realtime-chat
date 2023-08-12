"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { FC, useState, useEffect } from "react";

interface FriendRequestsSidebarOptionsProps {
  sessionId: string;
  initialUnseenRequestCount: number;
}

const FriendRequestsSidebarOptions: FC<FriendRequestsSidebarOptionsProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  );

  useEffect(() => {
    const incomingFriendRequestsPusherKey = toPusherKey(
      `user:${sessionId}:incoming_friend_requests`
    );
    const friendsPusherKey = toPusherKey(`user:${sessionId}:friends`);

    const incomingFriendRequests = "incoming_friend_requests";
    const newFriend = "new_friend";

    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };
    const addedFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1);
    };

    pusherClient.subscribe(incomingFriendRequestsPusherKey);
    pusherClient.subscribe(friendsPusherKey);

    pusherClient.bind(incomingFriendRequests, friendRequestHandler);
    pusherClient.bind(newFriend, addedFriendHandler);

    return () => {
      pusherClient.unsubscribe(incomingFriendRequestsPusherKey);
      pusherClient.unsubscribe(friendsPusherKey);

      pusherClient.unbind(incomingFriendRequests, friendRequestHandler);
      pusherClient.unbind(newFriend, addedFriendHandler);
    };
  }, [sessionId]);

  return (
    <Link
      href={"/dashboard/requests"}
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6  w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Friend Requests</p>

      {unseenRequestCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestsSidebarOptions;
