"use client";

import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

// Import shadcn UI table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import icons
import { Download, Filter, Calendar, User, ChevronDown } from "lucide-react";

const VaccineManagement = () => {
  const { infantDataDownload } = useProtectedRoutesApi();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["infant-data"],
    queryFn: infantDataDownload,
  });

  // State to hold the currently selected baranggay filter
  const [selectedBaranggay, setSelectedBaranggay] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Compute a unique list of baranggays from the API data
  const uniqueBaranggays = useMemo(() => {
    if (!data?.data) return [];
    const bars = data.data
      .map((infant) => infant.address?.baranggay)
      .filter(Boolean);
    return Array.from(new Set(bars));
  }, [data]);

  // Filter the data based on the selected baranggay
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    if (selectedBaranggay === "All") return data.data;
    return data.data.filter(
      (infant) => infant.address?.baranggay === selectedBaranggay
    );
  }, [data, selectedBaranggay]);

  // Use the address from the first record in filtered data
  const displayAddress = filteredData?.[0]?.address;

  // Helper to format an ISO date string into a locale date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format the birthday from the nested birthday object
  const formatBirthday = (birthday) => {
    if (!birthday) return "N/A";
    return `${birthday.month}/${birthday.day}/${birthday.year}`;
  };

  // Calculate the age in months from the birthday
  const calculateAgeInMonths = (birthday) => {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday.year, birthday.month - 1, birthday.day);
    const now = new Date();
    const yearsDiff = now.getFullYear() - birthDate.getFullYear();
    const monthsDiff = now.getMonth() - birthDate.getMonth();
    return yearsDiff * 12 + monthsDiff;
  };

  // Get dose info for a vaccination schedule
  const getDoseInfo = (schedule) => {
    const frequency = schedule.vaccine_names?.[0]?.frequency || 0;
    const doses = [];

    for (let doseNumber = 1; doseNumber <= frequency; doseNumber++) {
      let doseText, updateDoseField;

      switch (doseNumber) {
        case 1:
          doseText = "1st Dose";
          updateDoseField = schedule.UpdateFirstDose;
          break;
        case 2:
          doseText = "2nd Dose";
          updateDoseField = schedule.UpdateSecondDose;
          break;
        case 3:
          doseText = "3rd Dose";
          updateDoseField = schedule.UpdateThirdDose;
          break;
        default:
          doseText = "";
          updateDoseField = null;
      }

      if (updateDoseField) {
        doses.push({
          text: `${doseText} - ${formatDate(updateDoseField)}`,
          hasDate: true,
        });
      } else {
        doses.push({
          text: `${doseText} - Not yet Updated`,
          hasDate: false,
        });
      }
    }

    return doses;
  };

  // Helper to sort vaccination schedules by vaccine type code (ascending)
  const sortSchedules = (schedules) => {
    return [...schedules].sort((a, b) => {
      const codeA = parseInt(
        a.vaccine_names?.[0]?.vaccine_type_code || "0",
        10
      );
      const codeB = parseInt(
        b.vaccine_names?.[0]?.vaccine_type_code || "0",
        10
      );
      return codeA - codeB;
    });
  };

  // Create sorted vaccine columns from the first infant's vaccination schedules
  const sortedVaccineSchedules = filteredData?.[0]?.Vaccination_Schedule
    ? sortSchedules(filteredData[0].Vaccination_Schedule)
    : [];
  const vaccineColumns = sortedVaccineSchedules.map(
    (schedule) => schedule.vaccine_names?.[0]?.vaccine_name || "Vaccine"
  );

  // Excel download function using SheetJS (xlsx)
  const downloadExcel = () => {
    // Transform filteredData into an array of objects for Excel export
    const excelData = filteredData.map((infant) => {
      const sortedSchedules = sortSchedules(infant.Vaccination_Schedule);
      const vaccineInfo = sortedSchedules.map((schedule) => {
        return getDoseInfo(schedule)
          .map((dose) => dose.text)
          .join(" | ");
      });

      return {
        "Mother's Name": infant.mothers_name,
        "Child's Name": infant.fullname,
        Birthday: formatBirthday(infant.birthday),
        // Add vaccine info dynamically based on vaccineColumns order
        ...vaccineColumns.reduce((acc, vaccine, idx) => {
          acc[vaccine] = vaccineInfo[idx] || "";
          return acc;
        }, {}),
        "Age (Months)": calculateAgeInMonths(infant.birthday),
        Weight: `${infant.weight} kg`,
        Height: `${infant.height} cm`,
        // Move Baranggay to the last column
        Baranggay: infant.address?.baranggay || "",
      };
    });

    // Sort the data by Baranggay only when filter is set to "All"
    if (selectedBaranggay === "All") {
      excelData.sort((a, b) => a["Baranggay"].localeCompare(b["Baranggay"]));
    }

    // Create a worksheet from the JSON data
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Define column widths in the desired order
    const colWidths = [
      { wch: 20 }, // Mother's Name
      { wch: 20 }, // Child's Name
      { wch: 12 }, // Birthday
    ];
    // Set fixed width for each vaccine column
    vaccineColumns.forEach(() => colWidths.push({ wch: 30 }));
    colWidths.push({ wch: 15 }); // Age (Months)
    colWidths.push({ wch: 10 }); // Weight
    colWidths.push({ wch: 10 }); // Height
    colWidths.push({ wch: 15 }); // Baranggay

    worksheet["!cols"] = colWidths;

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

    // Generate and download the Excel file
    XLSX.writeFile(workbook, "immunization-records.xlsx");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4faff] text-[#333]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#8993ff] border-t-[#f4faff] rounded-full animate-spin"></div>
          <p className="text-xl font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4faff] text-[#333]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Error</p>
          <p>{error instanceof Error ? error.message : "An error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen bg-[#f4faff]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="p-4 md:p-8 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8 overflow-x-auto">
        {/* Header Section */}
        <header className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#333] text-center md:text-left mb-4 md:mb-0">
              Immunization Records Dashboard
            </h1>

            <div className="flex items-center space-x-4">
              <button
                onClick={downloadExcel}
                className="px-4 py-2 bg-[#8993ff] text-white rounded-md hover:bg-[#93acff] transition-colors flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Download</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-4 py-2 bg-[#accbff] text-[#333] rounded-md hover:bg-[#dbedff] transition-colors flex items-center space-x-2"
                >
                  <Filter size={18} />
                  <span>Filter</span>
                  <ChevronDown
                    size={16}
                    className={`transform ${
                      isFilterOpen ? "rotate-180" : ""
                    } transition-transform`}
                  />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4">
                    <label className="block text-sm font-medium text-[#333] mb-2">
                      Select Baranggay
                    </label>
                    <select
                      value={selectedBaranggay}
                      onChange={(e) => setSelectedBaranggay(e.target.value)}
                      className="w-full border border-[#dbedff] rounded-md px-3 py-2 text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8993ff]"
                    >
                      <option value="All">All Baranggays</option>
                      {uniqueBaranggays.map((baranggay, idx) => (
                        <option key={idx} value={baranggay}>
                          {baranggay}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#dbedff] p-4 rounded-md">
            <h2 className="text-lg font-semibold text-[#333] mb-2">
              {selectedBaranggay === "All"
                ? "All Baranggays - Ligao City, Albay"
                : `Baranggay ${selectedBaranggay}`}
            </h2>

            {selectedBaranggay !== "All" && displayAddress && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm font-medium text-[#333]">
                    <span className="text-[#8993ff]">Baranggay:</span>{" "}
                    {displayAddress.baranggay}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm font-medium text-[#333]">
                    <span className="text-[#8993ff]">Municipality:</span>{" "}
                    {displayAddress.municipality}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm font-medium text-[#333]">
                    <span className="text-[#8993ff]">Province:</span>{" "}
                    {displayAddress.province}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Data Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#333] mb-4">
            Data Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#f4faff] p-4 rounded-md border border-[#dbedff]">
              <p className="text-sm text-[#333]">Total Records</p>
              <p className="text-2xl font-bold text-[#8993ff]">
                {filteredData.length}
              </p>
            </div>
            <div className="bg-[#f4faff] p-4 rounded-md border border-[#dbedff]">
              <p className="text-sm text-[#333]">Unique Baranggays</p>
              <p className="text-2xl font-bold text-[#8993ff]">
                {uniqueBaranggays.length}
              </p>
            </div>
            <div className="bg-[#f4faff] p-4 rounded-md border border-[#dbedff]">
              <p className="text-sm text-[#333]">Vaccine Types</p>
              <p className="text-2xl font-bold text-[#8993ff]">
                {vaccineColumns.length}
              </p>
            </div>
            <div className="bg-[#f4faff] p-4 rounded-md border border-[#dbedff]">
              <p className="text-sm text-[#333]">Selected Area</p>
              <p className="text-lg font-bold text-[#8993ff] truncate">
                {selectedBaranggay}
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#333] mb-4">
            BASELINE WEIGHT AND IMMUNIZATION RECORDS OF PRESCHOOL CHILDREN
          </h2>

          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-[#accbff]">
                  <TableHead className="text-[#333] font-semibold p-3 text-left border border-[#dbedff]">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>Mother's Name</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[#333] font-semibold p-3 text-left border border-[#dbedff]">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>Child's Name</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[#333] font-semibold p-3 text-left border border-[#dbedff]">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>Birthday</span>
                    </div>
                  </TableHead>
                  {vaccineColumns.map((vaccine, idx) => (
                    <TableHead
                      key={idx}
                      className="text-[#333] font-semibold p-3 text-left border border-[#dbedff]"
                    >
                      {vaccine}
                    </TableHead>
                  ))}
                  <TableHead className="text-[#333] font-semibold p-3 text-left border border-[#dbedff]">
                    Age (Months)
                  </TableHead>
                  <TableHead className="text-[#333] font-semibold p-3 text-left border border-[#dbedff]">
                    Weight
                  </TableHead>
                  <TableHead className="text-[#333] font-semibold p-3 text-left border border-[#dbedff]">
                    Height
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((infant) => {
                  // Sort each infant's vaccination schedules by vaccine type code
                  const sortedSchedules = sortSchedules(
                    infant.Vaccination_Schedule
                  );
                  return (
                    <TableRow
                      key={infant.id}
                      className="hover:bg-[#f4faff] transition-colors"
                    >
                      <TableCell className="p-3 border border-[#dbedff] text-[#333]">
                        {infant.mothers_name}
                      </TableCell>
                      <TableCell className="p-3 border border-[#dbedff] text-[#333]">
                        {infant.fullname}
                      </TableCell>
                      <TableCell className="p-3 border border-[#dbedff] text-[#333]">
                        {formatBirthday(infant.birthday)}
                      </TableCell>
                      {sortedSchedules.map((schedule, idx) => (
                        <TableCell
                          key={idx}
                          className="p-3 border border-[#dbedff] text-[#333]"
                        >
                          {getDoseInfo(schedule).map((dose, doseIndex, arr) => (
                            <React.Fragment key={doseIndex}>
                              <div
                                className={`p-2 rounded-md ${
                                  dose.hasDate ? "bg-[#dbedff]" : "bg-red-100"
                                } mb-1`}
                              >
                                {dose.text}
                              </div>
                              {doseIndex < arr.length - 1 && (
                                <hr className="my-1 border-t border-[#dbedff]" />
                              )}
                            </React.Fragment>
                          ))}
                        </TableCell>
                      ))}
                      <TableCell className="p-3 border border-[#dbedff] text-[#333]">
                        {calculateAgeInMonths(infant.birthday)}
                      </TableCell>
                      <TableCell className="p-3 border border-[#dbedff] text-[#333]">
                        {infant.weight} kg
                      </TableCell>
                      <TableCell className="p-3 border border-[#dbedff] text-[#333]">
                        {infant.height} cm
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VaccineManagement;
