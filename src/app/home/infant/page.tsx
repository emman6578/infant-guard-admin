"use client";

import React from "react";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import InfantList from "./infantList";
import AddInfantModal from "./addInfantModal";

const InfantManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Container for Sidebar and Main Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar becomes full width on mobile and fixed on larger screens */}
        <aside className="w-full md:w-64 bg-white shadow">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
          <div className="max-w-6xl mx-auto space-y-8">
            <AddInfantModal />
            <InfantList />
          </div>
        </main>
      </div>

      {/* Footer remains at the bottom */}
      <Footer />
    </div>
  );
};

export default InfantManagement;
