"use client";

import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

// Import shadcn UI table components – adjust the import paths as needed
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VaccineManagement = () => {
  const { infantDataDownload } = useProtectedRoutesApi();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["infant-data"],
    queryFn: infantDataDownload,
  });

  // State to hold the currently selected baranggay filter.
  // "All" will mean no filtering.
  const [selectedBaranggay, setSelectedBaranggay] = useState("All");

  // Compute a unique list of baranggays from the API data
  const uniqueBaranggays = useMemo(() => {
    if (!data?.data) return [];
    const bars = data.data
      .map((infant: any) => infant.address?.baranggay)
      .filter(Boolean);
    return Array.from(new Set(bars));
  }, [data]);

  // Filter the data based on the selected baranggay.
  // If "All" is selected, we show all records.
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    if (selectedBaranggay === "All") return data.data;
    return data.data.filter(
      (infant: any) => infant.address?.baranggay === selectedBaranggay
    );
  }, [data, selectedBaranggay]);

  // Use the address from the first record in filtered data to display the location details.
  const displayAddress = filteredData?.[0]?.address;

  // Helper to format an ISO date string into a locale date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format the birthday from the nested birthday object
  const formatBirthday = (
    birthday: { month: number; day: number; year: number } | null
  ) => {
    if (!birthday) return "N/A";
    return `${birthday.month}/${birthday.day}/${birthday.year}`;
  };

  // Calculate the age in months from the birthday
  const calculateAgeInMonths = (
    birthday: { month: number; day: number; year: number } | null
  ) => {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday.year, birthday.month - 1, birthday.day);
    const now = new Date();
    const yearsDiff = now.getFullYear() - birthDate.getFullYear();
    const monthsDiff = now.getMonth() - birthDate.getMonth();
    return yearsDiff * 12 + monthsDiff;
  };

  // Get dose info for a vaccination schedule.
  // For each dose, display the updated dose date if available; otherwise, show "Not yet Updated"
  // and style it accordingly: light green if date exists, light red if not.
  const getDoseInfo = (schedule: any) => {
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
  const sortSchedules = (schedules: any[]) => {
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
  // in the filtered data.
  const sortedVaccineSchedules = filteredData?.[0]?.Vaccination_Schedule
    ? sortSchedules(filteredData[0].Vaccination_Schedule)
    : [];
  const vaccineColumns = sortedVaccineSchedules.map(
    (schedule: any) => schedule.vaccine_names?.[0]?.vaccine_name || "Vaccine"
  );

  // Excel download function using SheetJS (xlsx)
  // const downloadExcel = () => {
  //   // Transform filteredData into an array of objects for Excel export
  //   const excelData = filteredData.map((infant: any) => {
  //     const sortedSchedules = sortSchedules(infant.Vaccination_Schedule);
  //     const vaccineInfo = sortedSchedules.map((schedule: any) => {
  //       return getDoseInfo(schedule)
  //         .map((dose) => dose.text)
  //         .join(" | ");
  //     });

  //     return {
  //       "Mother's Name": infant.mothers_name,
  //       "Child's Name": infant.fullname,
  //       Birthday: formatBirthday(infant.birthday),
  //       ...vaccineColumns.reduce((acc: any, vaccine: string, idx: number) => {
  //         acc[vaccine] = vaccineInfo[idx] || "";
  //         return acc;
  //       }, {}),
  //       "Age (Months)": calculateAgeInMonths(infant.birthday),
  //       Weight: `${infant.weight} kg`,
  //       Height: `${infant.height} cm`,
  //     };
  //   });

  //   // Create a worksheet from the JSON data
  //   const worksheet = XLSX.utils.json_to_sheet(excelData);

  //   // Set column widths for better readability
  //   // Order is: Mother's Name, Child's Name, Birthday, [vaccine columns...], Age, Weight, Height
  //   const colWidths = [
  //     { wch: 20 }, // Mother's Name
  //     { wch: 20 }, // Child's Name
  //     { wch: 12 }, // Birthday
  //   ];
  //   // Set a fixed width for each vaccine column (adjust as needed)
  //   vaccineColumns.forEach(() => colWidths.push({ wch: 30 }));
  //   colWidths.push({ wch: 15 }); // Age (Months)
  //   colWidths.push({ wch: 10 }); // Weight
  //   colWidths.push({ wch: 10 }); // Height

  //   worksheet["!cols"] = colWidths;

  //   // Create a new workbook and append the worksheet
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
  //   // Generate and download the Excel file
  //   XLSX.writeFile(workbook, "immunization-records.xlsx");
  // };

  const downloadExcel = () => {
    // Transform filteredData into an array of objects for Excel export
    const excelData = filteredData.map((infant: any) => {
      const sortedSchedules = sortSchedules(infant.Vaccination_Schedule);
      const vaccineInfo = sortedSchedules.map((schedule: any) => {
        return getDoseInfo(schedule)
          .map((dose) => dose.text)
          .join(" | ");
      });

      return {
        "Mother's Name": infant.mothers_name,
        "Child's Name": infant.fullname,
        Birthday: formatBirthday(infant.birthday),
        // Add vaccine info dynamically based on vaccineColumns order
        ...vaccineColumns.reduce((acc: any, vaccine: string, idx: number) => {
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

    // Define column widths in the desired order:
    // Mother's Name, Child's Name, Birthday, [vaccine columns...], Age (Months), Weight, Height, Baranggay
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

  if (isLoading) return <div>Loading...</div>;
  if (isError)
    return (
      <div>
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </div>
    );

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8">
        {/* Redesigned Header */}
        <header className="flex items-center justify-between mb-8">
          {/* Top Left: Download Button */}
          <div className="flex-shrink-0">
            <button
              onClick={downloadExcel}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Download Excel
            </button>
          </div>

          {/* Center: Table Title */}
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">
              BASELINE WEIGHT AND IMMUNIZATION RECORDS OF PRESCHOOL CHILDREN
            </h1>
          </div>

          {/* Top Right: Baranggay Details and Filter */}
          <div className="flex flex-col items-end">
            {selectedBaranggay === "All" ? (
              <div className="text-sm font-semibold">Ligao City Albay</div>
            ) : (
              displayAddress && (
                <div className="text-sm">
                  <div>
                    <span className="font-semibold">Baranggay:</span>{" "}
                    {displayAddress.baranggay}
                  </div>
                  <div>
                    <span className="font-semibold">Municipality:</span>{" "}
                    {displayAddress.municipality}
                  </div>
                  <div>
                    <span className="font-semibold">Province:</span>{" "}
                    {displayAddress.province}
                  </div>
                </div>
              )
            )}
            <div className="mt-2 flex items-center gap-2">
              <label
                htmlFor="baranggay-select"
                className="text-sm font-medium whitespace-nowrap"
              >
                Filter by Baranggay:
              </label>
              <select
                id="baranggay-select"
                value={selectedBaranggay}
                onChange={(e) => setSelectedBaranggay(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="All">All</option>
                {uniqueBaranggays.map((baranggay, idx) => (
                  <option key={idx} value={baranggay}>
                    {baranggay}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Visible Table Section */}
        <div id="downloadable-table">
          <Table className="shadow rounded">
            <TableHeader className="bg-gray-200">
              <TableRow>
                <TableHead>Mother's Name</TableHead>
                <TableHead>Child's Name</TableHead>
                <TableHead>Birthday</TableHead>
                {vaccineColumns.map((vaccine: string, idx: number) => (
                  <TableHead key={idx}>{vaccine}</TableHead>
                ))}
                <TableHead>Age (Months)</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Height</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((infant: any) => {
                // Sort each infant's vaccination schedules by vaccine type code
                const sortedSchedules = sortSchedules(
                  infant.Vaccination_Schedule
                );
                return (
                  <TableRow key={infant.id}>
                    <TableCell>{infant.mothers_name}</TableCell>
                    <TableCell>{infant.fullname}</TableCell>
                    <TableCell>{formatBirthday(infant.birthday)}</TableCell>
                    {sortedSchedules.map((schedule: any, idx: number) => (
                      <TableCell key={idx}>
                        {getDoseInfo(schedule).map((dose, doseIndex, arr) => (
                          <React.Fragment key={doseIndex}>
                            <div
                              style={{
                                backgroundColor: dose.hasDate
                                  ? "#d4edda"
                                  : "#f8d7da",
                                padding: "4px",
                              }}
                            >
                              {dose.text}
                            </div>
                            {doseIndex < arr.length - 1 && (
                              <hr
                                style={{
                                  margin: "4px 0",
                                  borderTop: "1px solid #ccc",
                                }}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </TableCell>
                    ))}
                    <TableCell>
                      {calculateAgeInMonths(infant.birthday)}
                    </TableCell>
                    <TableCell>{infant.weight} kg</TableCell>
                    <TableCell>{infant.height} cm</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VaccineManagement;
