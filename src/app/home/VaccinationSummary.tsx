// import { useState } from "react";
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const VaccinationReportGenerator = ({ vaccinationData }: any) => {
//   const [reportType, setReportType] = useState("all");
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Get unique vaccines
//   const uniqueVaccines = [
//     ...new Set(
//       vaccinationData.flatMap((person) =>
//         person.vaccinationSched.map((vac) => vac.vaccineName)
//       )
//     ),
//   ].sort((a, b) => {
//     // Sort by the sort property from the first person who has this vaccine
//     const aSort =
//       vaccinationData[0].vaccinationSched.find((v) => v.vaccineName === a)
//         ?.sort || "0";
//     const bSort =
//       vaccinationData[0].vaccinationSched.find((v) => v.vaccineName === b)
//         ?.sort || "0";
//     return parseInt(aSort) - parseInt(bSort);
//   });

//   const generateReport = async () => {
//     try {
//       setIsGenerating(true);

//       // Sort the data alphabetically by name for better organization
//       const sortedData = [...vaccinationData].sort((a, b) =>
//         a.fullname.localeCompare(b.fullname)
//       );

//       // Create a new PDF document
//       const pdfDoc = await PDFDocument.create();

//       // Add a page to the document
//       // Use a larger page size for "all vaccines" option to ensure better fit
//       let page = pdfDoc.addPage(
//         reportType === "all" ? [1000, 595] : [842, 595]
//       ); // Wider for all vaccines

//       // Get the font
//       const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//       const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//       // Set page margins
//       const margin = 40;
//       const pageWidth = page.getWidth() - margin * 2;
//       const pageHeight = page.getHeight() - margin * 2;

//       // Set title
//       page.drawText("Vaccination Status Report", {
//         x: margin,
//         y: pageHeight - 20,
//         size: 18,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });

//       // Set report date
//       const currentDate = new Date().toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       });

//       page.drawText(`Generated on: ${currentDate}`, {
//         x: margin,
//         y: pageHeight - 40,
//         size: 10,
//         font: font,
//         color: rgb(0.3, 0.3, 0.3),
//       });

//       // Set report type
//       const reportTitle =
//         reportType === "all"
//           ? "All Vaccines Status Report"
//           : `${reportType} Status Report`;

//       page.drawText(reportTitle, {
//         x: margin,
//         y: pageHeight - 60,
//         size: 12,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });

//       // Filter data based on report type
//       let filteredData = sortedData;
//       let selectedVaccines = uniqueVaccines;

//       if (reportType !== "all") {
//         selectedVaccines = [reportType];
//       }

//       // Draw table header
//       const colWidths =
//         reportType === "all"
//           ? [
//               180, // Name (smaller when all vaccines)
//               60, // Gender (smaller when all vaccines)
//               100, // Barangay (smaller when all vaccines)
//               ...selectedVaccines.map(
//                 () => (pageWidth - 340) / selectedVaccines.length
//               ), // More space for vaccine columns
//             ]
//           : [
//               220, // Name (normal size for single vaccine)
//               80, // Gender (normal size for single vaccine)
//               120, // Barangay (normal size for single vaccine)
//               ...selectedVaccines.map(
//                 () => (pageWidth - 420) / selectedVaccines.length
//               ), // Vaccine columns
//             ];

//       let yPos = pageHeight - 90;
//       let xPos = margin;

//       // Draw header background
//       page.drawRectangle({
//         x: margin,
//         y: yPos - 20,
//         width: pageWidth,
//         height: 20,
//         color: rgb(0.95, 0.95, 0.95),
//         borderWidth: 1,
//         borderColor: rgb(0.8, 0.8, 0.8),
//       });

//       // Draw header texts
//       page.drawText("Full Name", {
//         x: xPos + 5,
//         y: yPos - 15,
//         size: 10,
//         font: boldFont,
//       });

//       xPos += colWidths[0];
//       page.drawText("Gender", {
//         x: xPos + 5,
//         y: yPos - 15,
//         size: 10,
//         font: boldFont,
//       });

//       xPos += colWidths[1];
//       page.drawText("Barangay", {
//         x: xPos + 5,
//         y: yPos - 15,
//         size: 10,
//         font: boldFont,
//       });

//       xPos += colWidths[2];

//       // Draw vaccine column headers
//       selectedVaccines.forEach((vaccine, i) => {
//         const vaccineWidth = colWidths[3 + i];
//         let displayName = vaccine;

//         // More aggressive abbreviation when all vaccines are selected
//         if (reportType === "all") {
//           // Always try to get acronym or shortest form
//           if (vaccine.includes("(") && vaccine.includes(")")) {
//             displayName = vaccine.substring(
//               vaccine.indexOf("(") + 1,
//               vaccine.indexOf(")")
//             );
//           } else if (vaccine.includes("Vaccine")) {
//             displayName = vaccine.replace(" Vaccine", "");
//           }

//           // If still too long, create a shorter acronym
//           if (displayName.length > 8) {
//             const words = displayName.split(" ");
//             if (words.length > 1) {
//               // Create acronym from first letters
//               displayName = words.map((word) => word[0]).join("");
//             } else {
//               // Just take first 6 characters
//               displayName = displayName.substring(0, 6) + "...";
//             }
//           }
//         } else {
//           // Regular abbreviation for single vaccine filter
//           if (vaccine.length > 15) {
//             // Get acronym or shorter version
//             if (vaccine.includes("Vaccine")) {
//               displayName = vaccine.replace(" Vaccine", "");
//             }
//             if (vaccine.includes("(") && vaccine.includes(")")) {
//               displayName = vaccine.substring(
//                 vaccine.indexOf("(") + 1,
//                 vaccine.indexOf(")")
//               );
//             }
//           }
//         }

//         page.drawText(displayName, {
//           x: xPos + 5,
//           y: yPos - 15,
//           size: reportType === "all" ? 8 : 9, // Smaller font when all vaccines
//           font: boldFont,
//         });

//         xPos += vaccineWidth;
//       });

//       // Draw table rows
//       yPos -= 20;

//       filteredData.forEach((person, idx) => {
//         const rowHeight = 20;

//         // Alternate row background
//         if (idx % 2 === 0) {
//           page.drawRectangle({
//             x: margin,
//             y: yPos - rowHeight,
//             width: pageWidth,
//             height: rowHeight,
//             color: rgb(0.97, 0.97, 0.97),
//           });
//         }

//         // Check if we need a new page
//         if (yPos < margin + rowHeight) {
//           // Add a new page (wider for all vaccines)
//           page = pdfDoc.addPage(
//             reportType === "all" ? [1000, 595] : [842, 595]
//           );
//           yPos = pageHeight - 40;

//           // Add continued header
//           page.drawText(`${reportTitle} (Continued)`, {
//             x: margin,
//             y: pageHeight - 20,
//             size: 14,
//             font: boldFont,
//           });

//           // Draw header again
//           yPos -= 30;
//           xPos = margin;

//           // Draw header background
//           page.drawRectangle({
//             x: margin,
//             y: yPos - 20,
//             width: pageWidth,
//             height: 20,
//             color: rgb(0.95, 0.95, 0.95),
//             borderWidth: 1,
//             borderColor: rgb(0.8, 0.8, 0.8),
//           });

//           // Draw header texts
//           page.drawText("Full Name", {
//             x: xPos + 5,
//             y: yPos - 15,
//             size: 10,
//             font: boldFont,
//           });

//           xPos += colWidths[0];
//           page.drawText("Gender", {
//             x: xPos + 5,
//             y: yPos - 15,
//             size: 10,
//             font: boldFont,
//           });

//           xPos += colWidths[1];
//           page.drawText("Barangay", {
//             x: xPos + 5,
//             y: yPos - 15,
//             size: 10,
//             font: boldFont,
//           });

//           xPos += colWidths[2];

//           // Draw vaccine column headers
//           selectedVaccines.forEach((vaccine, i) => {
//             const vaccineWidth = colWidths[3 + i];
//             let displayName = vaccine;

//             // Abbreviate long vaccine names
//             if (vaccine.length > 15) {
//               // Get acronym or shorter version
//               if (vaccine.includes("Vaccine")) {
//                 displayName = vaccine.replace(" Vaccine", "");
//               }
//               if (vaccine.includes("(") && vaccine.includes(")")) {
//                 displayName = vaccine.substring(
//                   vaccine.indexOf("(") + 1,
//                   vaccine.indexOf(")")
//                 );
//               }
//             }

//             page.drawText(displayName, {
//               x: xPos + 5,
//               y: yPos - 15,
//               size: 9,
//               font: boldFont,
//             });

//             xPos += vaccineWidth;
//           });

//           yPos -= 20;
//         }

//         // Draw person data
//         xPos = margin;

//         // Full Name - truncate if too long and all vaccines selected
//         let displayName = person.fullname;
//         if (reportType === "all" && displayName.length > 22) {
//           displayName = displayName.substring(0, 20) + "...";
//         }

//         page.drawText(displayName, {
//           x: xPos + 5,
//           y: yPos - 15,
//           size: reportType === "all" ? 8 : 9, // Smaller font when all vaccines
//           font: font,
//         });

//         // Gender
//         xPos += colWidths[0];
//         page.drawText(person.gender, {
//           x: xPos + 5,
//           y: yPos - 15,
//           size: reportType === "all" ? 8 : 9, // Smaller font when all vaccines
//           font: font,
//         });

//         // Barangay
//         xPos += colWidths[1];
//         page.drawText(person.address.baranggay, {
//           x: xPos + 5,
//           y: yPos - 15,
//           size: reportType === "all" ? 8 : 9, // Smaller font when all vaccines
//           font: font,
//         });

//         xPos += colWidths[2];

//         // Vaccine percentages
//         selectedVaccines.forEach((vaccineName, i) => {
//           const vaccineWidth = colWidths[3 + i];
//           const vaccine = person.vaccinationSched.find(
//             (v) => v.vaccineName === vaccineName
//           );
//           const percentage = vaccine ? vaccine.percentage : 0;

//           // Color coding for vaccination status
//           let statusText = "";
//           let textColor = rgb(0, 0, 0);

//           if (percentage === 0) {
//             statusText = "Not Started";
//             textColor = rgb(0.8, 0, 0);
//           } else if (percentage === 100) {
//             statusText = "Complete";
//             textColor = rgb(0, 0.6, 0);
//           } else {
//             statusText = `${percentage}%`;
//             textColor = rgb(0.8, 0.5, 0);
//           }

//           page.drawText(statusText, {
//             x: xPos + 5,
//             y: yPos - 15,
//             size: reportType === "all" ? 8 : 9, // Smaller font when all vaccines
//             font: font,
//             color: textColor,
//           });

//           xPos += vaccineWidth;
//         });

//         yPos -= rowHeight;
//       });

//       // Check if we need a new page for summary statistics
//       if (yPos < margin + 150) {
//         // Ensure enough space for summary (roughly)
//         // Add a new page (wider for all vaccines)
//         page = pdfDoc.addPage(reportType === "all" ? [1000, 595] : [842, 595]);
//         yPos = pageHeight - 40;

//         // Add header for summary page
//         page.drawText("Vaccination Status Summary", {
//           x: margin,
//           y: pageHeight - 20,
//           size: 14,
//           font: boldFont,
//         });

//         yPos -= 30;
//       }
//       page.drawText("Summary Statistics", {
//         x: margin,
//         y: yPos,
//         size: 12,
//         font: boldFont,
//       });

//       yPos -= 20;

//       // For "all vaccines" filter, create multi-column layout for summary stats
//       if (reportType === "all") {
//         const statsPerColumn = Math.ceil(selectedVaccines.length / 2);
//         const colWidth = pageWidth / 2 - 10;

//         // First column
//         let currentColumn = 1;
//         let currentX = margin;
//         let startY = yPos;
//         let currentY = startY;

//         selectedVaccines.forEach((vaccineName, index) => {
//           // Switch to second column after half the vaccines
//           if (index === statsPerColumn) {
//             currentColumn = 2;
//             currentX = margin + colWidth + 20;
//             currentY = startY; // Reset Y position for second column
//           }

//           const stats = calculateVaccineStats(filteredData, vaccineName);

//           // Shorten vaccine name for summary
//           let displayName = vaccineName;
//           if (vaccineName.length > 20) {
//             if (vaccineName.includes("(") && vaccineName.includes(")")) {
//               displayName = vaccineName.substring(
//                 vaccineName.indexOf("(") + 1,
//                 vaccineName.indexOf(")")
//               );
//             } else if (vaccineName.includes("Vaccine")) {
//               displayName = vaccineName.replace(" Vaccine", "");
//             }
//           }

//           page.drawText(`${displayName}:`, {
//             x: currentX,
//             y: currentY,
//             size: 9,
//             font: boldFont,
//           });

//           currentY -= 15;

//           const statText = `Complete: ${stats.complete} (${stats.completePercentage}%) | In Progress: ${stats.inProgress} (${stats.inProgressPercentage}%) | Not Started: ${stats.notStarted} (${stats.notStartedPercentage}%)`;

//           page.drawText(statText, {
//             x: currentX + 10,
//             y: currentY,
//             size: 8,
//             font: font,
//           });

//           currentY -= 15;
//         });
//       } else {
//         // Original single column layout for single vaccine filter
//         selectedVaccines.forEach((vaccineName) => {
//           const stats = calculateVaccineStats(filteredData, vaccineName);

//           page.drawText(`${vaccineName}:`, {
//             x: margin,
//             y: yPos,
//             size: 10,
//             font: boldFont,
//           });

//           yPos -= 15;
//           page.drawText(
//             `Complete: ${stats.complete} (${stats.completePercentage}%) | In Progress: ${stats.inProgress} (${stats.inProgressPercentage}%) | Not Started: ${stats.notStarted} (${stats.notStartedPercentage}%)`,
//             {
//               x: margin + 10,
//               y: yPos,
//               size: 9,
//               font: font,
//             }
//           );

//           yPos -= 15;
//         });
//       }

//       // Footer
//       page.drawText("This report is system-generated. For official use only.", {
//         x: pageWidth / 2 + margin - 100,
//         y: margin / 2,
//         size: 8,
//         font: font,
//         color: rgb(0.5, 0.5, 0.5),
//       });

//       // Serialize the PDF to bytes
//       const pdfBytes = await pdfDoc.save();

//       // Create a blob from the PDF bytes
//       const blob = new Blob([pdfBytes], { type: "application/pdf" });

//       // Create a URL for the blob
//       const url = URL.createObjectURL(blob);

//       // Create a link element and trigger the download
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `vaccination-report-${
//         reportType === "all"
//           ? "all-vaccines"
//           : reportType.toLowerCase().replace(/\s+/g, "-")
//       }-${new Date().toISOString().split("T")[0]}.pdf`;
//       link.click();

//       // Clean up
//       URL.revokeObjectURL(url);
//       setIsGenerating(false);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       setIsGenerating(false);
//     }
//   };

//   // Helper function to calculate statistics for a specific vaccine
//   const calculateVaccineStats = (data, vaccineName) => {
//     const total = data.length;
//     let complete = 0;
//     let inProgress = 0;
//     let notStarted = 0;

//     data.forEach((person) => {
//       const vaccine = person.vaccinationSched.find(
//         (v) => v.vaccineName === vaccineName
//       );
//       const percentage = vaccine ? vaccine.percentage : 0;

//       if (percentage === 0) {
//         notStarted++;
//       } else if (percentage === 100) {
//         complete++;
//       } else {
//         inProgress++;
//       }
//     });

//     return {
//       complete,
//       inProgress,
//       notStarted,
//       completePercentage: Math.round((complete / total) * 100),
//       inProgressPercentage: Math.round((inProgress / total) * 100),
//       notStartedPercentage: Math.round((notStarted / total) * 100),
//     };
//   };

//   return (
//     <Card className="p-4 mb-4">
//       <div className="flex flex-col space-y-4">
//         <h3 className="text-xl font-semibold">Generate Vaccination Report</h3>

//         <div className="flex items-center space-x-4">
//           <div className="w-64">
//             <Select value={reportType} onValueChange={setReportType}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Report Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Vaccines</SelectItem>
//                 {uniqueVaccines.map((vaccine) => (
//                   <SelectItem key={vaccine} value={vaccine}>
//                     {vaccine}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <Button
//             onClick={generateReport}
//             disabled={isGenerating}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             {isGenerating ? "Generating..." : "Generate PDF Report"}
//           </Button>
//         </div>

//         <div className="text-sm text-gray-500">
//           Generate a professional report of vaccination data organized by
//           vaccine type. Select a specific vaccine or generate a complete report
//           of all vaccines.
//         </div>
//       </div>
//     </Card>
//   );
// };

// export default VaccinationReportGenerator;

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VaccinationReportGenerator = ({ vaccinationData }: any) => {
  const [reportType, setReportType] = useState<"all" | "monthly">("all");
  const [isGenerating, setIsGenerating] = useState(false);

  // Get unique vaccines sorted properly
  const uniqueVaccines = [
    ...new Set(
      vaccinationData.flatMap((person) =>
        person.vaccinationSched.map((vac) => vac.vaccineName)
      )
    ),
  ].sort((a, b) => {
    const aSort =
      vaccinationData[0].vaccinationSched.find((v) => v.vaccineName === a)
        ?.sort || "0";
    const bSort =
      vaccinationData[0].vaccinationSched.find((v) => v.vaccineName === b)
        ?.sort || "0";
    return parseInt(aSort) - parseInt(bSort);
  });

  const getMonthlyVaccinations = () => {
    const monthlyData: {
      [key: string]: Array<{ name: string; vaccine: string; date: string }>;
    } = {};

    vaccinationData.forEach((person) => {
      person.vaccinationSched.forEach((vaccine) => {
        const doses = [vaccine.firstDose, vaccine.secondDose, vaccine.thirdDose]
          .filter((date) => date)
          .map((date) => new Date(date));

        doses.forEach((date, index) => {
          const monthYear = `${date.toLocaleString("default", {
            month: "long",
          })} ${date.getFullYear()}`;
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = [];
          }

          monthlyData[monthYear].push({
            name: person.fullname,
            vaccine: vaccine.vaccineName,
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          });
        });
      });
    });

    // Sort months chronologically
    return Object.keys(monthlyData)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .reduce((acc, key) => ({ ...acc, [key]: monthlyData[key] }), {});
  };

  const calculateVaccineStats = (data, vaccineName) => {
    const total = data.length;
    let complete = 0;
    let inProgress = 0;
    let notStarted = 0;

    data.forEach((person) => {
      const vaccine = person.vaccinationSched.find(
        (v) => v.vaccineName === vaccineName
      );
      const percentage = vaccine ? vaccine.percentage : 0;

      if (percentage === 0) {
        notStarted++;
      } else if (percentage === 100) {
        complete++;
      } else {
        inProgress++;
      }
    });

    return {
      complete,
      inProgress,
      notStarted,
      completePercentage: Math.round((complete / total) * 100),
      inProgressPercentage: Math.round((inProgress / total) * 100),
      notStartedPercentage: Math.round((notStarted / total) * 100),
    };
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      const sortedData = [...vaccinationData].sort((a, b) =>
        a.fullname.localeCompare(b.fullname)
      );

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([1000, 595]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 40;
      const pageWidth = page.getWidth() - margin * 2;
      const pageHeight = page.getHeight() - margin * 2;

      // Header Section
      const reportTitle =
        reportType === "all"
          ? "Vaccination Status Report - All Vaccines"
          : "Monthly Vaccination Report";

      page.drawText(reportTitle, {
        x: margin,
        y: pageHeight - 20,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      page.drawText(`Generated on: ${currentDate}`, {
        x: margin,
        y: pageHeight - 40,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });

      let yPos = pageHeight - 60;

      if (reportType === "all") {
        // All Vaccines Report Implementation
        const colWidths = [
          180, // Name
          60, // Gender
          100, // Barangay
          ...uniqueVaccines.map(
            () => (pageWidth - 340) / uniqueVaccines.length
          ),
        ];

        let yPos = pageHeight - 90;
        let xPos = margin;

        // Table Headers
        page.drawRectangle({
          x: margin,
          y: yPos - 20,
          width: pageWidth,
          height: 20,
          color: rgb(0.95, 0.95, 0.95),
        });

        const headers = [
          "Full Name",
          "Gender",
          "Barangay",
          ...uniqueVaccines.map((v) =>
            v.includes("(")
              ? v.substring(v.indexOf("(") + 1, v.indexOf(")"))
              : v.replace(" Vaccine", "")
          ),
        ];

        headers.forEach((header, i) => {
          page.drawText(header, {
            x: xPos + 5,
            y: yPos - 15,
            size: i < 3 ? 10 : 8,
            font: boldFont,
          });
          xPos += colWidths[i];
        });

        // Table Rows
        yPos -= 20;
        sortedData.forEach((person, idx) => {
          if (yPos < margin + 20) {
            page = pdfDoc.addPage([1000, 595]);
            yPos = pageHeight - 40;
            xPos = margin;

            // Add continued header
            page.drawText(
              "Vaccination Status Report - All Vaccines (Continued)",
              {
                x: margin,
                y: pageHeight - 20,
                size: 14,
                font: boldFont,
              }
            );

            // Redraw headers
            yPos -= 30;
            xPos = margin;
            headers.forEach((header, i) => {
              page.drawText(header, {
                x: xPos + 5,
                y: yPos - 15,
                size: i < 3 ? 10 : 8,
                font: boldFont,
              });
              xPos += colWidths[i];
            });
            yPos -= 20;
          }

          // Alternate row background
          if (idx % 2 === 0) {
            page.drawRectangle({
              x: margin,
              y: yPos - 20,
              width: pageWidth,
              height: 20,
              color: rgb(0.97, 0.97, 0.97),
            });
          }

          xPos = margin;
          const fields = [
            person.fullname.substring(0, 20) +
              (person.fullname.length > 20 ? "..." : ""),
            person.gender,
            person.address.baranggay,
            ...uniqueVaccines.map((vaccineName) => {
              const vaccine = person.vaccinationSched.find(
                (v) => v.vaccineName === vaccineName
              );
              const percentage = vaccine?.percentage || 0;
              return percentage === 0
                ? "Not Started"
                : percentage === 100
                ? "Complete"
                : `${percentage}%`;
            }),
          ];

          fields.forEach((field, i) => {
            const color =
              i >= 3
                ? field === "Not Started"
                  ? rgb(0.8, 0, 0)
                  : field === "Complete"
                  ? rgb(0, 0.6, 0)
                  : rgb(0.8, 0.5, 0)
                : rgb(0, 0, 0);

            page.drawText(field, {
              x: xPos + 5,
              y: yPos - 15,
              size: i < 3 ? 9 : 8,
              font: font,
              color: color,
            });
            xPos += colWidths[i];
          });

          yPos -= 20;
        });

        // Summary Statistics
        if (yPos < margin + 150) {
          page = pdfDoc.addPage([1000, 595]);
          yPos = pageHeight - 40;
        }

        page.drawText("Summary Statistics", {
          x: margin,
          y: yPos,
          size: 12,
          font: boldFont,
        });

        yPos -= 20;

        // Multi-column summary layout
        const statsPerColumn = Math.ceil(uniqueVaccines.length / 2);
        const colWidth = pageWidth / 2 - 10;

        // First column
        let currentColumn = 1;
        let currentX = margin;
        let startY = yPos;
        let currentY = startY;

        uniqueVaccines.forEach((vaccineName, index) => {
          if (index === statsPerColumn) {
            currentColumn = 2;
            currentX = margin + colWidth + 20;
            currentY = startY;
          }

          const stats = calculateVaccineStats(sortedData, vaccineName);
          const displayName = vaccineName
            .replace(/ Vaccine/g, "")
            .replace(/\(([^)]+)\)/g, "$1");

          page.drawText(`${displayName}:`, {
            x: currentX,
            y: currentY,
            size: 9,
            font: boldFont,
          });

          currentY -= 15;

          const statText = `Complete: ${stats.complete} (${stats.completePercentage}%) | In Progress: ${stats.inProgress} (${stats.inProgressPercentage}%) | Not Started: ${stats.notStarted} (${stats.notStartedPercentage}%)`;

          page.drawText(statText, {
            x: currentX + 10,
            y: currentY,
            size: 8,
            font: font,
          });

          currentY -= 15;
        });
      } else {
        const monthlyData = getMonthlyVaccinations();
        const months = Object.keys(monthlyData);

        months.forEach((month) => {
          if (yPos < margin + 50) {
            page = pdfDoc.addPage([1000, 595]);
            yPos = pageHeight - 40;
          }

          // Month header
          page.drawText(month, {
            x: margin,
            y: yPos,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          yPos -= 20;

          // Table headers
          page.drawRectangle({
            x: margin,
            y: yPos - 20,
            width: pageWidth,
            height: 20,
            color: rgb(0.95, 0.95, 0.95),
          });

          const headers = ["Name", "Vaccine", "Date"];
          const colWidths = [350, 400, 150];
          let xPos = margin;

          headers.forEach((header, i) => {
            page.drawText(header, {
              x: xPos + 5,
              y: yPos - 15,
              size: 10,
              font: boldFont,
            });
            xPos += colWidths[i];
          });

          yPos -= 30;

          // Table rows
          monthlyData[month].forEach((entry, idx) => {
            if (yPos < margin + 30) {
              page = pdfDoc.addPage([1000, 595]);
              yPos = pageHeight - 40;
              yPos -= 50;
            }

            if (idx % 2 === 0) {
              page.drawRectangle({
                x: margin,
                y: yPos - 20,
                width: pageWidth,
                height: 20,
                color: rgb(0.97, 0.97, 0.97),
              });
            }

            xPos = margin;
            const fields = [
              entry.name,
              entry.vaccine.replace(/ Vaccine/g, ""),
              entry.date,
            ];

            fields.forEach((field, i) => {
              page.drawText(field, {
                x: xPos + 5,
                y: yPos - 15,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
              });
              xPos += colWidths[i];
            });

            yPos -= 20;
          });

          yPos -= 30; // Space between months
        });
      }

      // Generate PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vaccination-report-${
        reportType === "all" ? "all" : "monthly"
      }-${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 mb-4 bg-[#dbedff] mt-4">
      <div className="flex flex-col space-y-4">
        <h3 className="text-xl font-semibold">Generate Vaccination Report</h3>
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <Select
              value={reportType}
              onValueChange={(v: "all" | "monthly") => setReportType(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vaccines</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {reportType === "all"
            ? "Generate complete vaccination status report across all vaccines."
            : "Generate monthly report showing vaccinations administered by month."}
        </div>
      </div>
    </Card>
  );
};

export default VaccinationReportGenerator;
