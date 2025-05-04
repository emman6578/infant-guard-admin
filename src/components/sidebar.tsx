"use client";

import React from "react";
import LogoutBtn from "./logoutBtn";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  unreadCount?: number;
}

const Sidebar = ({ unreadCount }: SidebarProps) => {
  const router = useRouter();
  const currentPath = usePathname();

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) =>
    currentPath === path ||
    (path === "/home" && (currentPath === "/" || currentPath === "/home"));

  const buttonClasses = (path: string) =>
    `px-4 py-3 rounded-lg transition-colors duration-200 text-left text-base font-semibold
    ${
      isActive(path)
        ? "bg-[#7faaff] text-[#555555]" // Active: Darker blue bg, deeper blue text
        : "text-[#3d3d3d] hover:bg-[#a8cfff]" // Inactive: Darker mid-blue text, deeper hover bg
    }`;

  return (
    <aside className="bg-[#e0eaff] text-black p-5 h-full sticky top-0 w-64 shadow-lg">
      <div className="mb-16">
        <p className="text-2xl font-extrabold text-[#555555]">Administrator</p>
      </div>

      <nav className="flex flex-col gap-3">
        <button
          onClick={() => handleTabClick("/home")}
          className={buttonClasses("/home")}
        >
          Home
        </button>

        <button
          onClick={() => handleTabClick("/home/parent")}
          className={buttonClasses("/home/parent")}
        >
          Parent Management
        </button>

        <button
          onClick={() => handleTabClick("/home/infant")}
          className={buttonClasses("/home/infant")}
        >
          Infant Management
        </button>

        <button
          onClick={() => handleTabClick("/home/vaccine")}
          className={buttonClasses("/home/vaccine")}
        >
          Reports
        </button>

        <button
          onClick={() => handleTabClick("/home/messages")}
          className={buttonClasses("/home/messages")}
        >
          Messages{" "}
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs font-medium rounded-full px-2 py-0.5 ml-2">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick("/home/contact")}
          className={buttonClasses("/home/contact")}
        >
          About Us
        </button>
      </nav>

      <div className="mt-20">
        <LogoutBtn />
      </div>
    </aside>
  );
};

export default Sidebar;
