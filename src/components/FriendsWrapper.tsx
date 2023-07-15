import { FC, ReactNode } from "react";

interface FriendsWrapperProps {
  children: ReactNode;
}

const FriendsWrapper: FC<FriendsWrapperProps> = ({ children }) => {
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      {children}
    </main>
  );
};

export default FriendsWrapper;
