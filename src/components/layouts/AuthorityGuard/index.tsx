import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthentication } from "@/hooks/useAuthentication";
// import { useUserAuthority } from "@/hooks/useUserAuthority";

type AuthorityGuard = { children: ReactNode };

// const pageIdentity = {
//   "/dashboard/home": "dashboard",
//   "/dashboard/functions": "function",
//   "/dashboard/transaction-log": "transaction",
//   "/dashboard/compliance": "compliance",
//   "/dashboard/dispute-log": "dispute",
//   "/dashboard/api-key": "",
//   "/dashboard/profile": "profile",
//   "/dashboard/role": "role",
//   "/dashboard/team-members": "team",
// };

const AuthorityGuard = (props: AuthorityGuard) => {
  const { children } = props;
  // const location = useLocation();

  const isAuthenticated = useAuthentication();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // return true ? children : <Navigate to="/dashboard/dispute-log" />;
  return children;
};

export default AuthorityGuard;
