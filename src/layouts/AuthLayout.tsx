import Container from "@/components/layouts/Container";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <Container
      noGutter
      fullWidth
      fullHeight
      display="flex"
      className="overflow-hidden dark:bg-slate-950 bg-[#F7F9FE]"
    >
      <Outlet />
    </Container>
  );
};
