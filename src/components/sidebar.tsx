"use client";

import React from "react";
import LogoutBtn from "./logoutBtn";
import { usePathname, useRouter } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();
  const currentPath = usePathname();

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  // Add path aliases if needed (e.g. root path -> /home)
  const isHomeActive = currentPath === "/" || currentPath === "/home";

  return (
    <aside className="bg-[#ffbd5f] text-black p-3 h-full sticky top-0">
      <p className="mb-20 text-2xl font-bold">Admin Dashboard</p>
      <nav className="flex flex-col gap-2">
        <button
          onClick={() => handleTabClick("/home")}
          className={`px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200 text-left text-lg font-bold ${
            isHomeActive ? "bg-gray-800 text-blue-400" : ""
          }`}
        >
          Home
        </button>

        <button
          onClick={() => handleTabClick("/home/parent")}
          className={`px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200 text-left text-lg font-bold ${
            currentPath === "/home/parent" ? "bg-gray-800 text-blue-400" : ""
          }`}
        >
          Parent Management
        </button>

        <button
          onClick={() => handleTabClick("/home/infant")}
          className={`px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200 text-left text-lg font-bold ${
            currentPath === "/home/infant" ? "bg-gray-800 text-blue-400" : ""
          }`}
        >
          Infant Management
        </button>

        <button
          onClick={() => handleTabClick("/home/vaccine")}
          className={`px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200 text-left text-lg font-bold ${
            currentPath === "/home/vaccine" ? "bg-gray-800 text-blue-400" : ""
          }`}
        >
          Download Data
        </button>

        <button
          onClick={() => handleTabClick("/home/about")}
          className={`px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200 text-left text-lg font-bold ${
            currentPath === "/about" ? "bg-gray-800 text-blue-400" : ""
          }`}
        >
          Download Vaccine Form
        </button>

        <button
          onClick={() => handleTabClick("/contact")}
          className={`px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200 text-left text-lg font-bold ${
            currentPath === "/contact" ? "bg-gray-800 text-blue-400" : ""
          }`}
        >
          Contact Us
        </button>
      </nav>
      <div className="mt-10 align-middle">
        <LogoutBtn />
      </div>
    </aside>
  );
};

export default Sidebar;
