import AuthorityGuard from "@/components/layouts/AuthorityGuard";
import { ReactNode } from "react";

type ProtectedRoute = {
  children: ReactNode;
};

export const ProtectedRoute = (props: ProtectedRoute) => {
  return <AuthorityGuard>{props.children}</AuthorityGuard>;
};
