// import React, { useState, useMemo } from "react";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableHead,
//   TableCell,
// } from "@/components/ui/table";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   LineChart,
//   Line,
// } from "recharts";
// import { useRouter } from "next/navigation";
// import { ChevronUp, ChevronDown } from "lucide-react";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";

// interface InfantData {
//   id: string;
//   fullname: string;
//   vaccinationSched: { vaccineName: string; percentage: number }[];
// }

// interface VaccineStat {
//   vaccineName: string;
//   avg: number;
//   min: number;
//   max: number;
// }

// interface Props {
//   filteredVaccineData: InfantData[];
//   vaccineStats: VaccineStat[];
//   individualData: { id: string; name: string; percentage: number }[];
//   isLoadingVaccine: boolean;
//   isErrorVaccine: boolean;
//   vaccineError: any;
//   selectedVaccine: string;
//   setSelectedVaccine: (vaccine: string) => void;
// }

// const PAGE_W = 800;
// const PAGE_H = 600;
// const MARGIN = 40;
// const FONT_SIZE = 9;
// const ROW_H = 14;
// const HEADER_H = 18;
// const COL_W = [380, 100];

// // Wrap a long string into lines of maxChars characters
// function wrapText(text: string, maxChars: number) {
//   const words = text.split(" ");
//   const lines: string[] = [];
//   let line = "";
//   for (const w of words) {
//     if ((line + " " + w).trim().length > maxChars) {
//       lines.push(line.trim());
//       line = w;
//     } else {
//       line += " " + w;
//     }
//   }
//   if (line) lines.push(line.trim());
//   return lines;
// }

// // Draws a simple 2-column table starting at (startX, startY)
// function drawTable(
//   page: PDFPage,
//   startX: number,
//   startY: number,
//   headers: string[],
//   rows: { nameLines: string[]; coverage: string }[],
//   font: PDFFont
// ) {
//   let y = startY;

//   // Header background
//   page.drawRectangle({
//     x: startX,
//     y: y - HEADER_H,
//     width: COL_W[0] + COL_W[1],
//     height: HEADER_H,
//     color: rgb(0.9, 0.9, 0.9),
//   });

//   // Header text
//   let x = startX;
//   headers.forEach((h, i) => {
//     page.drawText(h, {
//       x: x + 2,
//       y: y - HEADER_H + 4,
//       size: FONT_SIZE,
//       font,
//     });
//     x += COL_W[i];
//   });
//   y -= HEADER_H;

//   // Rows
//   for (const row of rows) {
//     // Determine cell height based on wrapped name lines
//     const nameLines = row.nameLines;
//     const cellHeight = Math.max(ROW_H, FONT_SIZE * nameLines.length + 4);

//     // Stop if next row would overflow
//     if (y - cellHeight < MARGIN) break;

//     // Name cell
//     page.drawRectangle({
//       x: startX,
//       y: y - cellHeight,
//       width: COL_W[0],
//       height: cellHeight,
//       borderColor: rgb(0, 0, 0),
//       borderWidth: 0.5,
//     });
//     nameLines.forEach((line, idx) => {
//       page.drawText(line, {
//         x: startX + 2,
//         y: y - FONT_SIZE * (idx + 1) - 2,
//         size: FONT_SIZE,
//         font,
//       });
//     });

//     // Coverage cell
//     page.drawRectangle({
//       x: startX + COL_W[0],
//       y: y - cellHeight,
//       width: COL_W[1],
//       height: cellHeight,
//       borderColor: rgb(0, 0, 0),
//       borderWidth: 0.5,
//     });
//     page.drawText(row.coverage, {
//       x: startX + COL_W[0] + 2,
//       y: y - FONT_SIZE - 4,
//       size: FONT_SIZE,
//       font,
//     });

//     y -= cellHeight;
//   }
// }

// export default function VaccineDashboard({
//   filteredVaccineData,
//   vaccineStats,
//   individualData,
//   isLoadingVaccine,
//   isErrorVaccine,
//   vaccineError,
//   selectedVaccine,
//   setSelectedVaccine,
// }: Props) {
//   const router = useRouter();
//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof (typeof individualData)[0];
//     direction: "asc" | "desc";
//   }>({ key: "name", direction: "asc" });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const sortedData = useMemo(() => {
//     const sorted = [...individualData];
//     sorted.sort((a, b) => {
//       if (a[sortConfig.key] < b[sortConfig.key])
//         return sortConfig.direction === "asc" ? -1 : 1;
//       if (a[sortConfig.key] > b[sortConfig.key])
//         return sortConfig.direction === "asc" ? 1 : -1;
//       return 0;
//     });
//     return sorted;
//   }, [individualData, sortConfig]);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedData.slice(start, start + itemsPerPage);
//   }, [sortedData, currentPage]);

//   const totalPages = Math.ceil(sortedData.length / itemsPerPage);

//   const requestSort = (key: keyof (typeof individualData)[0]) => {
//     let direction: "asc" | "desc" = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   const CustomDot = (props: any) => {
//     const { cx, cy, payload } = props;
//     const handleClick = () => {
//       if (payload?.id) {
//         router.push(`/home/infant/details?id=${payload.id}`);
//       }
//     };
//     return (
//       <g onClick={handleClick} style={{ cursor: "pointer" }}>
//         <circle cx={cx} cy={cy} r={5} fill="#004749" />
//       </g>
//     );
//   };

//   const generatePDFReport = async () => {
//     const pdf = await PDFDocument.create();
//     const helv = await pdf.embedFont(StandardFonts.Helvetica);

//     // Single landscape page
//     const page = pdf.addPage([PAGE_W, PAGE_H]);

//     // Title
//     page.drawText(
//       `Vaccination Report: ${selectedVaccine || "Overall Summary"}`,
//       { x: MARGIN, y: PAGE_H - MARGIN, size: 18, font: helv }
//     );

//     // Compute totals
//     const total = filteredVaccineData.length;
//     let vaccinated = 0;
//     filteredVaccineData.forEach((infant) => {
//       if (selectedVaccine) {
//         const s = infant.vaccinationSched.find(
//           (v) => v.vaccineName === selectedVaccine
//         );
//         if (s?.percentage === 100) vaccinated++;
//       } else {
//         if (infant.vaccinationSched.every((v) => v.percentage === 100))
//           vaccinated++;
//       }
//     });
//     const notVaccinated = total - vaccinated;

//     // Summary stats
//     const statsY = PAGE_H - MARGIN - 30;
//     page.drawText(`Total Infants: ${total}`, {
//       x: MARGIN,
//       y: statsY,
//       size: FONT_SIZE + 2,
//       font: helv,
//     });
//     page.drawText(`Vaccinated: ${vaccinated}`, {
//       x: MARGIN,
//       y: statsY - 18,
//       size: FONT_SIZE + 2,
//       font: helv,
//     });
//     page.drawText(`Not Vaccinated: ${notVaccinated}`, {
//       x: MARGIN,
//       y: statsY - 36,
//       size: FONT_SIZE + 2,
//       font: helv,
//     });

//     // Build table data
//     const tableRows = filteredVaccineData.map((infant) => {
//       const covValue = selectedVaccine
//         ? infant.vaccinationSched.find((v) => v.vaccineName === selectedVaccine)
//             ?.percentage ?? 0
//         : Math.round(
//             infant.vaccinationSched.reduce((sum, v) => sum + v.percentage, 0) /
//               infant.vaccinationSched.length
//           );
//       return {
//         nameLines: wrapText(infant.fullname.trim(), 30),
//         coverage: `${covValue}%`,
//         _numericCoverage: covValue, // attach for sorting
//       };
//     });

//     // **SORT ascending by numeric coverage (0 → 100)**
//     tableRows.sort((a, b) => a._numericCoverage - b._numericCoverage);

//     // Draw table under summary
//     drawTable(page, MARGIN, statsY - 60, ["Name", "Coverage"], tableRows, helv);

//     // Download
//     const bytes = await pdf.save();
//     const blob = new Blob([bytes], { type: "application/pdf" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${selectedVaccine || "vaccination-summary"}-report.pdf`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="w-full space-y-8">
//       {/* Summary & Chart */}
//       <div className="bg-white shadow rounded-lg p-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold">
//             Vaccination Coverage ({filteredVaccineData.length} Infants)
//           </h1>
//           <button
//             onClick={generatePDFReport}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Download PDF Report
//           </button>
//         </div>
//         {isLoadingVaccine ? (
//           <p>Loading vaccine graph data...</p>
//         ) : isErrorVaccine ? (
//           <p className="text-red-500">Error: {vaccineError?.message}</p>
//         ) : (
//           <div className="h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={vaccineStats}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="vaccineName"
//                   angle={-20}
//                   textAnchor="end"
//                   interval={0}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
//                 <Tooltip
//                   content={({ active, payload }) =>
//                     active && payload?.length ? (
//                       <div className="bg-white p-4 shadow-lg rounded-lg">
//                         <p className="font-bold">
//                           {payload[0].payload.vaccineName}
//                         </p>
//                         <p>Average: {payload[0].payload.avg.toFixed(1)}%</p>
//                         <p>
//                           Range: {payload[0].payload.min}% -{" "}
//                           {payload[0].payload.max}%
//                         </p>
//                         <button
//                           className="mt-2 text-blue-600 hover:underline"
//                           onClick={() =>
//                             setSelectedVaccine(payload[0].payload.vaccineName)
//                           }
//                         >
//                           Show individual data →
//                         </button>
//                       </div>
//                     ) : null
//                   }
//                 />
//                 <Bar
//                   dataKey="avg"
//                   name="Average Coverage"
//                   fill="#004749"
//                   onClick={(data) => setSelectedVaccine(data.vaccineName)}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </div>

//       {/* Drill-down & Table */}
//       <div className="bg-white shadow rounded-lg p-10">
//         <h2 className="text-xl font-bold mb-4">
//           {selectedVaccine
//             ? `${selectedVaccine} Coverage`
//             : "Individual Vaccine Drill Down"}
//         </h2>

//         {selectedVaccine ? (
//           <>
//             <div className="mb-6">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-gray-100 rounded-t-lg border-b">
//                     <TableHead
//                       className="cursor-pointer"
//                       onClick={() => requestSort("name")}
//                     >
//                       Name
//                     </TableHead>
//                     <TableHead
//                       className="cursor-pointer text-right"
//                       onClick={() => requestSort("percentage")}
//                     >
//                       <div className="flex items-center justify-end gap-1">
//                         Coverage
//                         {sortConfig.key === "percentage" &&
//                           (sortConfig.direction === "asc" ? (
//                             <ChevronUp className="w-4 h-4" />
//                           ) : (
//                             <ChevronDown className="w-4 h-4" />
//                           ))}
//                       </div>
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {paginatedData.map((infant) => (
//                     <TableRow
//                       key={infant.id}
//                       className="hover:bg-gray-50 cursor-pointer"
//                       onClick={() =>
//                         router.push(`/home/infant/details?id=${infant.id}`)
//                       }
//                     >
//                       <TableCell>{infant.name}</TableCell>
//                       <TableCell className="text-right">
//                         {infant.percentage}%
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>

//               {totalPages > 1 && (
//                 <div className="mt-4">
//                   <Pagination>
//                     <PaginationContent>
//                       <PaginationItem>
//                         <PaginationPrevious
//                           onClick={() =>
//                             setCurrentPage((p) => Math.max(1, p - 1))
//                           }
//                           aria-disabled={currentPage === 1}
//                         />
//                       </PaginationItem>
//                       <PaginationItem>
//                         Page {currentPage} of {totalPages}
//                       </PaginationItem>
//                       <PaginationItem>
//                         <PaginationNext
//                           onClick={() =>
//                             setCurrentPage((p) => Math.min(totalPages, p + 1))
//                           }
//                           aria-disabled={currentPage === totalPages}
//                         />
//                       </PaginationItem>
//                     </PaginationContent>
//                   </Pagination>
//                 </div>
//               )}
//             </div>

//             <div className="h-[400px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart
//                   data={individualData}
//                   margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" hide />
//                   <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
//                   <Tooltip
//                     formatter={(value: number) => [`${value}%`, "Coverage"]}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="percentage"
//                     stroke="#004749"
//                     dot={<CustomDot />}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//               <p className="text-sm text-gray-600 mt-2">
//                 Showing {individualData.length} infants, sorted by coverage
//                 percentage. Click dots to view infant details.
//               </p>
//             </div>
//           </>
//         ) : (
//           <div className="h-[400px] flex items-center justify-center border-dashed border-gray-300 rounded p-4">
//             <p>
//               Please select a vaccine from the chart above to see individual
//               data.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";

interface InfantData {
  id: string;
  fullname: string;
  vaccinationSched: { vaccineName: string; percentage: number }[];
}

interface VaccineStat {
  vaccineName: string;
  avg: number;
  min: number;
  max: number;
}

interface Props {
  filteredVaccineData: InfantData[];
  vaccineStats: VaccineStat[];
  individualData: { id: string; name: string; percentage: number }[];
  isLoadingVaccine: boolean;
  isErrorVaccine: boolean;
  vaccineError: any;
  selectedVaccine: string;
  setSelectedVaccine: (vaccine: string) => void;
}

const PAGE_W = 800;
const PAGE_H = 600;
const MARGIN = 40;
const FONT_SIZE = 9;
const ROW_H = 14;
const HEADER_H = 18;
const COL_W = [380, 100];

function wrapText(text: string, maxChars: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      lines.push(line.trim());
      line = w;
    } else {
      line += " " + w;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

function drawTable(
  page: PDFPage,
  startX: number,
  startY: number,
  headers: string[],
  rows: { nameLines: string[]; coverage: string }[],
  font: any
) {
  let y = startY;

  // Header background: ACCBFF
  page.drawRectangle({
    x: startX,
    y: y - HEADER_H,
    width: COL_W[0] + COL_W[1],
    height: HEADER_H,
    color: rgb(0.67, 0.8, 1), // #accbff
  });

  let x = startX;
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: x + 4,
      y: y - HEADER_H + 4,
      size: FONT_SIZE,
      font,
      color: rgb(0.1, 0.15, 0.56), // #243c8f dark text
    });
    x += COL_W[i];
  });
  y -= HEADER_H;

  for (const row of rows) {
    const nameLines = row.nameLines;
    const cellHeight = Math.max(ROW_H, FONT_SIZE * nameLines.length + 4);
    if (y - cellHeight < MARGIN) break;

    // Zebra fill: alternate pure white vs DBEDFF
    const fill =
      (rows.indexOf(row) + 1) % 2 === 0
        ? rgb(0.86, 0.93, 1) // #dbedff
        : rgb(1, 1, 1); // white

    page.drawRectangle({
      x: startX,
      y: y - cellHeight,
      width: COL_W[0],
      height: cellHeight,
      color: fill,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.2,
    });
    nameLines.forEach((line, idx) => {
      page.drawText(line, {
        x: startX + 4,
        y: y - FONT_SIZE * (idx + 1) - 2,
        size: FONT_SIZE,
        font,
        color: rgb(0, 0, 0),
      });
    });

    page.drawRectangle({
      x: startX + COL_W[0],
      y: y - cellHeight,
      width: COL_W[1],
      height: cellHeight,
      color: fill,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.2,
    });
    page.drawText(row.coverage, {
      x: startX + COL_W[0] + 4,
      y: y - FONT_SIZE - 4,
      size: FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });

    y -= cellHeight;
  }
}

export default function VaccineDashboard({
  filteredVaccineData,
  vaccineStats,
  individualData,
  isLoadingVaccine,
  isErrorVaccine,
  vaccineError,
  selectedVaccine,
  setSelectedVaccine,
}: Props) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof (typeof individualData)[0];
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = useMemo(() => {
    const sorted = [...individualData];
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [individualData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const requestSort = (key: keyof (typeof individualData)[0]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const handleClick = () => {
      if (payload?.id) {
        router.push(`/home/infant/details?id=${payload.id}`);
      }
    };
    return (
      <g onClick={handleClick} style={{ cursor: "pointer" }}>
        <circle cx={cx} cy={cy} r={5} fill="#93acff" />
      </g>
    );
  };

  const generatePDFReport = async () => {
    const pdf = await PDFDocument.create();
    const helv = await pdf.embedFont(StandardFonts.Helvetica);
    const page = pdf.addPage([PAGE_W, PAGE_H]);

    page.drawText(
      `Vaccination Report: ${selectedVaccine || "Overall Summary"}`,
      {
        x: MARGIN,
        y: PAGE_H - MARGIN,
        size: 18,
        font: helv,
        color: rgb(0.1, 0.15, 0.56), // dark heading
      }
    );

    // ... summary stats ...

    const tableRows = filteredVaccineData.map((infant) => {
      const covValue = selectedVaccine
        ? infant.vaccinationSched.find((v) => v.vaccineName === selectedVaccine)
            ?.percentage ?? 0
        : Math.round(
            infant.vaccinationSched.reduce((sum, v) => sum + v.percentage, 0) /
              infant.vaccinationSched.length
          );
      return {
        nameLines: wrapText(infant.fullname.trim(), 30),
        coverage: `${covValue}%`,
        _numericCoverage: covValue,
      };
    });
    tableRows.sort((a, b) => a._numericCoverage - b._numericCoverage);

    drawTable(
      page,
      MARGIN,
      PAGE_H - MARGIN - 60,
      ["Name", "Coverage"],
      tableRows,
      helv
    );

    const bytes = await pdf.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedVaccine || "vaccination-summary"}-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-8 bg-[#f4faff] px-6 py-8">
      {/* Summary & Chart */}
      <div className="bg-[#dbedff] shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#585858]">
            Vaccination Coverage ({filteredVaccineData.length})
          </h1>
          <button
            onClick={generatePDFReport}
            className="px-4 py-2 bg-gradient-to-r from-[#93acff] to-[#8993ff] text-[#3d3d3d] rounded-lg shadow hover:opacity-90"
          >
            Download PDF Report
          </button>
        </div>
        {isLoadingVaccine ? (
          <p className="text-[#93acff]">Loading data...</p>
        ) : isErrorVaccine ? (
          <p className="text-[#8993ff]">Error: {vaccineError?.message}</p>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vaccineStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid stroke="#accbff" strokeDasharray="4 4" />
                <XAxis
                  dataKey="vaccineName"
                  tick={{ fill: "#0000000", fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "#000000" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f4faff",
                    borderColor: "#93acff",
                  }}
                />
                <Bar
                  dataKey="avg"
                  fill="#8993ff"
                  onClick={(d) => setSelectedVaccine(d.vaccineName)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Drill-down & Table */}
      <div className="bg-[#dbedff] shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#4e4e4e] mb-4">
          {selectedVaccine
            ? `${selectedVaccine} Coverage`
            : "Select a vaccine above"}
        </h2>

        {selectedVaccine ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-[#93acff]">
                  <TableHead
                    className="text-white cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    Name
                  </TableHead>
                  <TableHead
                    className="text-white text-right cursor-pointer"
                    onClick={() => requestSort("percentage")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Coverage
                      {sortConfig.key === "percentage" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        ))}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((infant) => (
                  <TableRow
                    key={infant.id}
                    className="hover:bg-[#accbff] cursor-pointer"
                    onClick={() =>
                      router.push(`/home/infant/details?id=${infant.id}`)
                    }
                  >
                    <TableCell className="text-[#505050]">
                      {infant.name}
                    </TableCell>
                    <TableCell className="text-[#505050] text-right">
                      {infant.percentage}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center space-x-4 text-[#4b4b4b]">
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
                <span>
                  Page {currentPage} / {totalPages}
                </span>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                />
              </div>
            )}

            <div className="h-[400px] mt-6 pb-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={individualData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid stroke="#accbff" strokeDasharray="4 4" />
                  <XAxis dataKey="name" hide />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "#8993ff" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Coverage"]}
                    contentStyle={{
                      backgroundColor: "#f4faff",
                      borderColor: "#93acff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#8993ff"
                    dot={<CustomDot />}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-2 text-[#8993ff] text-sm mb-4">
                Showing {individualData.length} infants. Click a point for
                details.
              </p>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-[#accbff] rounded">
            <p className="text-[#8993ff]">Click a bar above to drill down.</p>
          </div>
        )}
      </div>
    </div>
  );
}
