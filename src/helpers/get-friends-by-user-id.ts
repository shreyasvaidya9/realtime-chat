import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  // retrive friends for current user
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friendResponse = (await fetchRedis(
        "get",
        `user:${friendId}`
      )) as string;

      const friend = JSON.parse(friendResponse) as User;

      return friend;
    })
  );

  return friends;
};
