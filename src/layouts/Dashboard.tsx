import Container from "@/components/layouts/Container";
import { Outlet } from "react-router-dom";
import { SideBar } from "./Sidebar";
import { Header } from "./Header";
import { useEffect, useState } from "react";

export const Dashboard = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [show, setShow] = useState<boolean>(false);
  const [showSideBarOnSM, setShowSideBarOnSM] = useState<boolean>(false); // Corrected variable name

  // Automatically close sidebar on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // Adjust this breakpoint as needed
        setShow(false);
        setSidebarCollapsed(false);
        setShowSideBarOnSM(true); // Update showSideBarOnSM state when on small screens
      } else {
        setSidebarCollapsed(false);
        setShow(true);
        setShowSideBarOnSM(false); // Update showSideBarOnSM state when not on small screens
      }
    };

    // Call handleResize on component mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Container
      noGutter
      fullWidth
      fullHeight
      display="flex"
      className="overflow-x-hidden overflow-y-auto dark:bg-slate-950 bg-[#F7F9FE] relative"
    >
      {showSideBarOnSM ? (
        show ? (
          <SideBar
            isSidebarCollapsed={isSidebarCollapsed}
            showSidebarSm={showSideBarOnSM}
          />
        ) : (
          ""
        )
      ) : (
        <SideBar isSidebarCollapsed={isSidebarCollapsed} />
      )}

      <Container noGutter className="w-full overflow-auto">
        <Header
          showSideBar={show}
          setShow={setShow}
          showSideBarOnSM={showSideBarOnSM}
          isSidebarCollapsed={isSidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <Container>
          <Outlet />
        </Container>
      </Container>
    </Container>
  );
};
