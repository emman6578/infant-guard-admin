"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  authToken: string | null;
  updateAuthToken: (newToken: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  const router = useRouter();

  // Load token from localStorage (or cookies)
  useEffect(() => {
    const loadAuthToken = () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setAuthToken(storedToken);
      }
    };
    loadAuthToken();
  }, []);

  // Redirect user based on authentication status
  useEffect(() => {
    if (!authToken) {
      router.replace("/auth/login");
    }
    if (authToken) {
      router.replace("/");
    }
  }, [authToken, router]);

  // Update auth token when user logs in or out
  const updateAuthToken = async (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
    setAuthToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ authToken, updateAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
