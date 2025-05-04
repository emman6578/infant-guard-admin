"use client";

import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContextProvider";

export default function LogoutBtn() {
  const { updateAuthToken } = useAuth();
  const router = useRouter();

  const deleteToken = () => {
    return localStorage.removeItem("authToken");
  };

  const handlePress = async () => {
    deleteToken();
    await updateAuthToken(null);
    router.replace("/auth/login");
  };

  return (
    <Button
      onClick={handlePress}
      className="bg-[#cc7171] text-[#ffffff] hover:bg-[#dbedff] hover:text-[#f4faff] font-semibold border border-[#8993ff] px-6 py-2 rounded-lg transition duration-300 shadow-sm"
    >
      Logout
    </Button>
  );
}
