/* eslint-disable @typescript-eslint/no-explicit-any */
import { MdDashboard } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import Img from "../assets/react.svg";
import { MdLogout } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

import { ComponentClass, ComponentProps, FunctionComponent } from "react";
import { ConfirmAlert } from "@/components/layouts/ConfirmAlert";
import { IconType } from "react-icons/lib";

type sideBarProps = {
  isSidebarCollapsed: boolean;
  showSidebarSm?: boolean;
};

type NavigationItem = {
  icon: IconType,
  title: string,
  to: string,
  active: boolean,
  isImage?: boolean
}

export const SideBar = ({
  isSidebarCollapsed,
  showSidebarSm,
}: sideBarProps) => {
  const location = useLocation();

  const navigation: NavigationItem[] = [
    {
      icon: MdDashboard,
      title: "Dashboard",
      to: "/dashboard/home",
      active: location.pathname === "/dashboard/home",
    },
    // {
    //   icon: MdDashboard,
    //   title: "",
    //   to: "",
    //   active: location.pathname === "/dashboard/home",
    // },
  ];

  return (
    <aside
      className={`bg-primary ${
        isSidebarCollapsed
          ? showSidebarSm
            ? "w-[100rem]"
            : "w-20"
          : "w-[16rem] min-w-[16rem]"
      }`}
    >
      <div className="mt-10 mb-8">
        <div className="flex items-center justify-between px-3">
          <div className="h-10 w-20">
            <img src={Img} className="w-full h-full object-contain" />
          </div>
          <div className="h-8 w-8 rounded-full grid place-items-center bg-white/10">
            <RxHamburgerMenu className="text-white" />
          </div>
        </div>
      </div>

      <div className="overflow-auto h-[30rem]">
        {navigation.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            title={item.title}
            to={item.to}
            active={item.active}
            isImage={item?.isImage}
          />
        ))}

        {/* <SidebarItem
          icon={IoMail}
          title="Messaging"
          to="/dashboard/messaging"
          active={location.pathname === "/dashboard/messaging"}
        /> */}

        <ConfirmAlert
          text="Are you sure you want to log out?"
          title="Log Out"
          logout
          url=""
          trigger={
            <div className={`flex items-center gap-3 px-3 py-2 mb-2 mt-5 `}>
              <SidebarItemIcon icon={MdLogout} />
              <h6 className="font-medium text-sm text-white">Logout</h6>
            </div>
          }
        />
      </div>
    </aside>
  );
};

type SidebarItemProps = {
  title: string;
  active: boolean;
  className?: string;
  isImage?: boolean;
  to: string;
  icon: ComponentProps<FunctionComponent<any> | ComponentClass<any, any>>;
};

const SidebarItem = (props: SidebarItemProps) => {
  const Icon = props.icon;
  return (
    <Link to={props.to}>
      <div
        className={`flex items-center gap-3 px-3 py-2 mb-2  ${
          props.active ? " bg-white/10" : ""
        } ${props.className ?? ""}`}
      >
        <SidebarItemIcon icon={Icon} isImage={props.isImage} />
        <h6 className="font-medium text-sm text-white">{props.title}</h6>
      </div>
    </Link>
  );
};

type SidebarItemIconProps = {
  isImage?: boolean;
  icon: ComponentProps<FunctionComponent<any> | ComponentClass<any, any>>;
};

const SidebarItemIcon = (props: SidebarItemIconProps) => {
  const Icon = props.icon;
  return (
    <div className="h-8 w-8 bg-white rounded-md grid place-items-center">
      {props?.isImage ? (
        <img src={props.icon} className="h-5 w-5 text-primary" />
      ) : (
        <Icon className="h-5 w-5 text-primary" />
      )}
    </div>
  );
};
