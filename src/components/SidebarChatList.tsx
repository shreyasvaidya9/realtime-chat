"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    const userChatsPusherKey = toPusherKey(`user:${sessionId}:chats`);
    const userFriendsPusherKey = toPusherKey(`user:${sessionId}:friends`);
    const newMessageEvent = "new_message";
    const newFriendEvent = "new_friend";

    const newMessageHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) {
        return;
      }

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };
    const newFriendHandler = () => {
      router.refresh();
    };

    pusherClient.subscribe(userChatsPusherKey);
    pusherClient.subscribe(userFriendsPusherKey);

    pusherClient.bind(newMessageEvent, newMessageHandler);
    pusherClient.bind(newFriendEvent, newFriendHandler);

    return () => {
      pusherClient.unsubscribe(userChatsPusherKey);
      pusherClient.unsubscribe(userFriendsPusherKey);

      pusherClient.unbind(newMessageEvent, newMessageHandler);
      pusherClient.unbind(newFriendEvent, newFriendHandler);
    };
  }, [sessionId, router, pathname]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((message) => !pathname.includes(message.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMessage) => {
          return unseenMessage.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id}>
            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                friend.id,
                sessionId
              )}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
