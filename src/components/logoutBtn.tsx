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
    <div>
      <Button
        onClick={handlePress}
        variant={"secondary"}
        size={"lg"}
        className="bg-[#23966d]"
      >
        Logout
      </Button>
    </div>
  );
}
