"use client";

import React from "react";
import VaccineForm from "./vaccineForm"; // Ensure the correct import path

const VaccinePage = ({ childData }) => {
  if (!childData) {
    return (
      <div className="p-10">
        <h2 className="text-2xl font-bold">No Infant Selected</h2>
        <p>
          Please select an infant from the dropdown to view the immunization
          record.
        </p>
      </div>
    );
  }

  return <VaccineForm childData={childData} />;
};

export default VaccinePage;
