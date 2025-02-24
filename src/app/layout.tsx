import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContextProvider";
import { ProtectedRoutesContextProvider } from "@/libraries/API/ProtectedRoute/secureRoutes";
import TanStackProvider from "@/providers/TanStackProvider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContextProvider>
          <ProtectedRoutesContextProvider>
            <TanStackProvider>
              <Suspense>{children}</Suspense>
            </TanStackProvider>
          </ProtectedRoutesContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
