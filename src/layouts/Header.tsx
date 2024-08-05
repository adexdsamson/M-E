import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToastHandlers } from "@/hooks/useToaster";
import { useSetReset, useUser } from "@/store/authSlice";
import { ApiResponseError } from "@/types";
import { SearchIcon, ChevronDown, LogOut } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import { GrUserAdmin } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { TbUserHexagon, TbSettings2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { HiBars3 } from "react-icons/hi2";
import { useMediaQuery } from "usehooks-ts";

type HeaderProps = {
  showSideBarOnSM: boolean;
  showSideBar: boolean;
  setShow: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
  isSidebarCollapsed: boolean;
};

export const Header = (props: HeaderProps) => {
  const toggleSidebar = () => {
    props.setSidebarCollapsed(!props.isSidebarCollapsed);
    props.setShow(!props.showSideBar);
  };

  return (
    <header className="py-3 px-5 flex items-center justify-between shadow-md">
      {props.showSideBarOnSM ? (
        <ToggleButton
          {...{ isSidebarCollapsed: props.isSidebarCollapsed, toggleSidebar }}
        />
      ) : (
        <SearchComponent />
      )}

      <div className="flex items-center">
        {props.showSideBarOnSM ? null : (
          <div className="h-10 w-10 bg-gray-200 rounded-full cursor-pointer grid place-items-center mr-4">
            <FaRegBell className="text-black" />
          </div>
        )}
        <div className="h-6 bg-gray-400 w-0.5 rounded-lg" />
        <DropdownMenuDemo />
      </div>
    </header>
  );
};

const SearchComponent = () => {
  return (
    <div className="relative">
      <div className="rounded-lg w-80 h-9 bg-accent relative">
        <input className="w-full h-full px-2 bg-transparent" />
        <div className="h-7 w-7 rounded-full bg-primary grid place-items-center absolute top-1 right-3">
          <SearchIcon className="text-white h-3 w-3" />
        </div>
      </div>
    </div>
  );
};

type ToggleButtonProps = {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
};

const ToggleButton = ({
  isSidebarCollapsed,
  toggleSidebar,
}: ToggleButtonProps) => {
  return (
    <div onClick={toggleSidebar} className={` cursor-pointer`}>
      {isSidebarCollapsed ? (
        <div className=" hover:bg-primary/40 rounded-full bg-gray-100  transition-colors duration-500 p-0.5">
          <IoMdClose size={28} />
        </div>
      ) : (
        <HiBars3 size={30} />
      )}
    </div>
  );
};

export function DropdownMenuDemo() {
  const user = useUser();
  const onResetState = useSetReset();
  const toastHandler = useToastHandlers();

  const navigate = useNavigate();
  const matches = useMediaQuery("(min-width: 768px)");

  const handleLogOut = async () => {
    const TOAST_TITTLE = "Account Access";
    try {
      onResetState();
      navigate("/");
    } catch (error) {
      toastHandler.error(TOAST_TITTLE, error as ApiResponseError);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 pl-4">
          <Avatar className="!bg-gray-300 text-primary h-10 w-10">
            <AvatarImage src="" alt="" />
            <AvatarFallback>
              <FaUser />
            </AvatarFallback>
          </Avatar>
          <div className=" flex cursor-pointer gap-2 items-center">
            {!matches ? null : (
              <div>
                <p className="text-sm text-primary text-center">{`${user?.first_name} ${user?.last_name}`}</p>
                <p className="text-xs text-center text-[#5D0003] ">admin</p>
              </div>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>
          <TbUserHexagon className="mr-2 h-4 w-4 text-gray-600" />
          <span className="text-xs">My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <TbSettings2 className="mr-2 h-4 w-4 text-gray-600" />
          <span className="text-xs">Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <GrUserAdmin className="mr-2 h-4 w-4 text-gray-600" />
          <span className="text-xs">Add Admin</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogOut}>
          <LogOut className="mr-2 h-4 w-4 text-primary" />
          <span className="text-primary text-xs">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
