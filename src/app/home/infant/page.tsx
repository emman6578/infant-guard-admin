"use client";

import React from "react";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import InfantList from "./infantList";
import AddInfantModal from "./addInfantModal";

// Color palette constants
const COLORS = {
  lightBg: "#f4faff",
  mediumBg: "#dbedff",
  accentLight: "#accbff",
  accentMedium: "#93acff",
  accentDark: "#8993ff",
  text: "#333333", // Dark gray for text
};

const InfantManagement = () => {
  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col">
      {/* Container for Sidebar and Main Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar becomes full width on mobile and fixed on larger screens */}
        <aside className="w-full md:w-64 bg-white border-r border-[#accbff] shadow-sm">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 font-[family-name:var(--font-geist-sans)] text-[#333333]">
          {/* Header section with gradient background */}
          <div className="bg-gradient-to-r from-[#8993ff] to-[#93acff] p-4 sm:p-6 shadow-md">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-white text-2xl font-bold">
                Infant Management
              </h1>
              <p className="text-white opacity-90 mt-1">
                Monitor and manage infant records
              </p>
            </div>
          </div>

          {/* Main content with cards */}
          <div className="p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Action card with Add Infant button */}
              <div className="bg-white rounded-lg shadow-md border-2 border-[#accbff] p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h2 className="text-[#333333] text-xl font-semibold">
                      Infant Records
                    </h2>
                    <p className="text-[#333333] opacity-75 text-sm">
                      Add, view, and manage infant information
                    </p>
                  </div>

                  <div className="bg-[#dbedff] p-3 rounded-lg">
                    <AddInfantModal />
                  </div>
                </div>
              </div>

              {/* Content card with list */}
              <div className="bg-white rounded-lg shadow-md border border-[#dbedff] overflow-hidden">
                <div className="border-b border-[#accbff] bg-[#dbedff] p-4">
                  <h3 className="text-[#333333] font-medium">All Infants</h3>
                </div>
                <div className="p-4">
                  <InfantList />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer with accent color */}
      <div className="bg-white border-t-2 border-[#accbff]">
        <Footer />
      </div>
    </div>
  );
};

export default InfantManagement;
