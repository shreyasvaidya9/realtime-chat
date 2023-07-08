import { LucideProps, UserPlus } from "lucide-react";
import Logo from "./svg/Logo";

export const Icons = {
  Logo: (props: LucideProps) => {
    return <Logo {...props} />;
  },
  UserPlus,
};

export type Icon = keyof typeof Icons;
