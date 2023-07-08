import { FC, ReactNode } from "react";

interface SidebarTitleProp {
  children: ReactNode;
}

const SidebarTitle: FC<SidebarTitleProp> = ({ children }) => {
  return (
    <h6 className="text-xs font-semibold leading-6 text-gray-400">
      {children}
    </h6>
  );
};

export default SidebarTitle;
