import { useAuthentication } from "@/hooks/useAuthentication";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRoute = {
  children: ReactNode;
};

export const PublicRoute = (props: ProtectedRoute) => {
  const isAuthenticated = useAuthentication();
  return isAuthenticated ? <Navigate to="/dashboard/home" /> : props.children;
};
