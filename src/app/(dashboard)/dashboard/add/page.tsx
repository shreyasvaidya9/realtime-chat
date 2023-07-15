import { FC } from "react";

import AddFriendButton from "@/components/AddFriendButton";
import FriendsWrapper from "@/components/FriendsWrapper";

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
    <FriendsWrapper>
      <AddFriendButton />
    </FriendsWrapper>
  );
};

export default Page;
