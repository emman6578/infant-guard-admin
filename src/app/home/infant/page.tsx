"use client";

import React from "react";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import InfantList from "./infantList";

import AddInfantModal from "./addInfantModal";

//TODO: Dashboard infant coverage can be sorted by baranggay
//infant search bar, filter by purok,baranggay , gender

const InfantManagement = () => {
  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
      <Sidebar />

      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col h-[calc(100vh-4rem)] space-y-8 relative">
        <AddInfantModal />
        <InfantList />
      </main>

      <Footer />
    </div>
  );
};

export default InfantManagement;
