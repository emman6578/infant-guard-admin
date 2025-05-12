"use client";

import React, { useRef, useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

// Import PDF libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

// Custom hook to disable zooming
const useDisableZoom = () => {
  useEffect(() => {
    const preventKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=")
      ) {
        e.preventDefault();
      }
    };

    const preventWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventKeyDown, false);
    window.addEventListener("wheel", preventWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", preventKeyDown, false);
      window.removeEventListener("wheel", preventWheel);
    };
  }, []);
};

// Vaccine Schedule Data (from page2.tsx)
const vaccineSchedule = [
  {
    vaccine: "BCG Vaccine",
    disease: "Tuberculosis",
    atBirth: true,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: false,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Hepatitis B Vaccine",
    disease: "Hepatitis B",
    atBirth: true,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: false,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Pentavalent Vaccine",
    disease: "Diphtheria, Tetanus, Pertussis, Hib, Hep B",
    atBirth: false,
    sixWeeks: true,
    tenWeeks: true,
    fourteenWeeks: true,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Oral Polio Vaccine (OPV)",
    disease: "Polio",
    atBirth: false,
    sixWeeks: true,
    tenWeeks: true,
    fourteenWeeks: true,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Inactivated Polio Vaccine (IPV)",
    disease: "Polio",
    atBirth: false,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: true,
    nineMonths: true,
    oneYear: false,
  },
  {
    vaccine: "Pneumococcal Vaccine (PCV)",
    disease: "Pneumonia, meningitis, sepsis",
    atBirth: false,
    sixWeeks: true,
    tenWeeks: true,
    fourteenWeeks: true,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Measles, Mumps, Rubella (MMR)",
    disease: "Measles, mumps, rubella",
    atBirth: false,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: false,
    nineMonths: true,
    oneYear: true,
  },
];

// VaccineForm Component (from vaccineForm.tsx)
const VaccineForm = ({ childData }) => {
  // Disable zooming
  useDisableZoom();

  // Format Date of Birth from the nested birthday object
  const dob = childData?.birthday
    ? `${childData.birthday.month}/${childData.birthday.day}/${childData.birthday.year}`
    : "";

  // Combine address parts into a single string
  const fullAddress = childData?.address
    ? `${childData.address.purok}, ${childData.address.baranggay}, ${childData.address.municipality}, ${childData.address.province}`
    : "";

  // Get the vaccination schedules from the selected infant data
  const vaccinationSchedules = childData?.Vaccination_Schedule || [];

  // Sort the schedules by the vaccine type code (ascending)
  const sortedVaccinationSchedules = [...vaccinationSchedules].sort((a, b) => {
    const aCode =
      a.vaccine_names && a.vaccine_names[0]
        ? parseInt(a.vaccine_names[0].vaccine_type_code, 10)
        : 0;
    const bCode =
      b.vaccine_names && b.vaccine_names[0]
        ? parseInt(b.vaccine_names[0].vaccine_type_code, 10)
        : 0;
    return aCode - bCode;
  });

  return (
    <div style={{ transform: "scale(1)", transformOrigin: "top left" }}>
      <div className="p-10">
        {/* Header */}
        <h2 className="text-3xl font-bold text-left mb-6">
          Child Immunization Record
        </h2>

        {/* Child Information */}
        <table className="w-full mb-6">
          <tbody>
            <tr>
              {/* 1st Column */}
              <td className="px-4 py-2 align-top w-1/3">
                <p>
                  <strong>Child's Name:</strong> {childData.fullname}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {dob}
                </p>
                <p>
                  <strong>Place of Birth:</strong> {childData.place_of_birth}
                </p>
                <p>
                  <strong>Address:</strong> {fullAddress}
                </p>
              </td>

              {/* 2nd Column */}
              <td className="px-4 py-2 align-top w-1/3">
                <p>
                  <strong>Mother's Name:</strong> {childData.mothers_name}
                </p>
                <p>
                  <strong>Father's Name:</strong> {childData.fathers_name}
                </p>
                <p>
                  <strong>Birth Height:</strong> {childData.height} cm
                </p>
                <p>
                  <strong>Birth Weight:</strong> {childData.weight} kg
                </p>
                <p>
                  <strong>Sex:</strong> {childData.gender}
                </p>
              </td>

              {/* 3rd Column */}
              <td className="px-4 py-2 align-top w-1/3">
                <p>
                  <strong>Health Center:</strong> {childData.health_center}
                </p>
                <p>
                  <strong>Barangay:</strong> {childData.address?.baranggay}
                </p>
                <p>
                  <strong>Family No.:</strong> {childData.family_no}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Immunization Table Container */}
        <div
          className="w-full p-5 relative"
          style={{
            backgroundImage: "url('/bg_image_form.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          {/* Decorative Icons */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon 1.png"
            alt="Icon"
            className="absolute top-[190px] right-[20px] w-44 h-44"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon 2.png"
            alt="Icon"
            className="absolute top-[50px] right-[60px] w-28 h-28"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon 3.png"
            alt="Icon"
            className="absolute top-[426px] right-[0px] w-64 h-32"
          />

          {/* Immunization Table */}
          <Table className="w-[85%] h-full border-separate border-spacing-x-4 border-spacing-y-4">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-black bg-[#ffb43d] text-black p-2 text-center font-extrabold">
                  Bakuna
                </TableHead>
                <TableHead className="border border-black bg-[#ffb43d] text-black p-2 text-center font-extrabold">
                  Doses
                </TableHead>
                <TableHead className="border border-black bg-[#ffb43d] text-black p-2 text-center font-extrabold">
                  Petsa ng Bakuna (MM/DD/YY)
                </TableHead>
                <TableHead className="border border-black bg-[#ffb43d] text-black p-2 text-center font-extrabold">
                  Remarks
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVaccinationSchedules.map((schedule, index) => {
                // Assume each schedule has one vaccine (in vaccine_names array)
                const vaccineInfo =
                  schedule.vaccine_names && schedule.vaccine_names[0];

                // Use the frequency field as the number of doses expected.
                const doses = vaccineInfo ? vaccineInfo.frequency : 0;

                const doseDates = [];

                if (schedule.firstDose) {
                  doseDates.push(
                    schedule.UpdateFirstDose
                      ? new Date(schedule.UpdateFirstDose).toLocaleDateString()
                      : "N/A"
                  );
                }

                if (schedule.secondDose) {
                  doseDates.push(
                    schedule.UpdateSecondDose
                      ? new Date(schedule.UpdateSecondDose).toLocaleDateString()
                      : "N/A"
                  );
                }

                if (schedule.thirdDose) {
                  doseDates.push(
                    schedule.UpdateThirdDose
                      ? new Date(schedule.UpdateThirdDose).toLocaleDateString()
                      : "N/A"
                  );
                }

                // Combine remarks from different dose fields into one sentence.
                const getCombinedRemarks = (schedule) => {
                  const remarksArray = [];

                  if (schedule.remark_FirstDose) {
                    remarksArray.push(`1st Dose: ${schedule.remark_FirstDose}`);
                  }
                  if (schedule.remark_SecondDose) {
                    remarksArray.push(
                      `2nd Dose: ${schedule.remark_SecondDose}`
                    );
                  }
                  if (schedule.remark_ThirdDose) {
                    remarksArray.push(`3rd Dose: ${schedule.remark_ThirdDose}`);
                  }

                  return remarksArray.length > 0
                    ? remarksArray.join(", ")
                    : "N/A";
                };

                // Usage
                const remarks = getCombinedRemarks(schedule);

                return (
                  <TableRow key={index} className="bg-white">
                    <TableCell className="border border-black p-2 text-center">
                      {vaccineInfo ? vaccineInfo.vaccine_name : "N/A"}
                    </TableCell>
                    <TableCell className="border border-black p-2 text-center">
                      {doses}
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <div className="flex justify-center gap-2">
                        {doseDates.map((date, idx) => (
                          <span
                            key={idx}
                            className="flex-1 border border-black p-1"
                          >
                            {date}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="border border-black p-2 text-center">
                      {remarks}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Footer Instructions */}
        <p className="mt-6 text-sm">
          <strong>Instructions:</strong> Sa column ng{" "}
          <strong>Petsa ng Bakuna</strong>, isulat ang petsa ng pagbibigay ng
          bakuna. Sa column ng <strong>Remarks</strong>, isulat ang petsa ng
          pagbalik para sa susunod na dose, o anumang mahalagang impormasyon na
          maaaring makaapekto sa pagbabakuna ng bata.
        </p>
      </div>
    </div>
  );
};

// VaccinePage Component (from page1.tsx)
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

// VaccinePage2 Component (from page2.tsx)
const VaccinePage2 = () => {
  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('/bg_image_form2.png')" }}
    >
      <div className="w-full text-center">
        <h2 className="text-4xl font-bold mb-4 text-white text-left ml-10">
          Schedule ng pagbibigay ng bakuna <br /> para sa mga batang isang taon
          pababa
        </h2>

        {/* Table container at 100% width */}
        <div
          className="overflow-x-auto p-4 rounded shadow-lg mx-auto"
          style={{ width: "90%" }}
        >
          <table className="min-w-full text-sm border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-left">
                  Bakuna
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-left">
                  Sakit na Maiiwasan
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  At Birth
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  6 Weeks / 1.5 mos
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  10 Weeks / 2.5 mos
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  14 Weeks / 3.5 mos
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  9 Months
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  12 Months / 1 Year
                </th>
              </tr>
            </thead>
            <tbody>
              {vaccineSchedule.map((item) => (
                <tr key={item.vaccine}>
                  <td className="border border-black px-2 py-1 bg-white text-black text-left">
                    {item.vaccine}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-left">
                    {item.disease}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.atBirth ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.sixWeeks ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.tenWeeks ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.fourteenWeeks ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.nineMonths ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.oneYear ? "✔" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer: Mga paalala at 100% width */}
        <div
          className="mt-4 space-y-2 bg-white p-4 rounded shadow-lg mx-auto"
          style={{ width: "90%" }}
        >
          <h3 className="font-semibold text-center">Mga paalala:</h3>
          <ul className="list-disc ml-6 text-left">
            <li>
              Magsimula nang pagpapabakuna sa tamang edad at oras. Maari ring
              gawin ang bilang puwang kung kailangan ng bakuna.
            </li>
            <li>
              Sundin ang schedule ng pagbabakuna. Huwag magpatumpik-tumpik;
              importanteng protektahan ang bata mula sa mga sakit.
            </li>
            <li>
              Siguruhing updated ang pagbabakuna ng bata sa lahat ng recommended
              vaccines.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Component - Combined from page.tsx
const VaccineDownloadFormPage = () => {
  const {
    infantDataDownload,
    UploadDocumentToInfant,
    getPushToken,
    storeNotification,
  } = useProtectedRoutesApi();

  const updateMutation = useMutation({
    mutationFn: async ({
      title,
      body,
      data,
    }: {
      title: string;
      body: string;
      data: string;
    }) => {
      await storeNotification(title, body, data);
    },
    onSuccess: () => {},
    onError: (error: any) => {},
  });

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const infantId = searchParams.get("infantId");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["infant-data"],
    queryFn: infantDataDownload,
  });

  const sendNotifyMutation = useMutation({
    mutationFn: async ({
      infant_id,
      title,
      body,
      data,
    }: {
      infant_id: string;
      title: string;
      body: string;
      data: string;
    }) => {
      return getPushToken(infant_id, title, body, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infants"] });
    },
    onError: (err) => {
      console.error("Notification mutation failed:", err);
    },
  });

  const pdfRef = useRef(null);
  const [selectedBaranggay, setSelectedBaranggay] = useState("");
  const [selectedInfant, setSelectedInfant] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  // If infantId is provided via params, disregard filter selection
  const effectiveInfant = infantId
    ? data.data.find((infant) => infant.id === infantId)
    : selectedInfant;

  const handleNotify = async () => {
    try {
      await sendNotifyMutation.mutateAsync({
        infant_id: infantId!,
        title: `Vaccination Form is available to Download`,
        body: `Congratulations! 100% compliance rate for your infants vaccination`,
        data: "Vaccine Reminder",
      });

      //store this notif 3
      updateMutation.mutate({
        title: `Vaccination Form is available to Download`,
        body: `Congratulations! 100% compliance rate for your infants vaccination`,
        data: "Vaccine Reminder",
      });
    } catch (error) {
      console.error("handleNotify: Error sending notification:", error);
    }
  };

  // PDF saving function (modified)
  const handleSavePDF = async () => {
    if (!pdfRef.current) return;

    setIsSaving(true); // Disable button while saving

    try {
      // Set the backgroundColor explicitly to white
      const canvas = await html2canvas(pdfRef.current, {
        scale: 1, // lower scale for smaller image size
        useCORS: true,
        backgroundColor: "#ffffff", // ensure white background
      });

      // Convert to JPEG instead of PNG, and set quality to 0.7
      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the dimensions for the image in PDF
      const imgProps = pdf.getImageProperties(imgData);
      const imageAspectRatio = imgProps.height / imgProps.width;
      let renderedPdfHeight = pdfWidth * imageAspectRatio;
      let heightLeft = renderedPdfHeight;
      let position = 0;

      // Add pages until the entire image is added
      while (heightLeft > 0) {
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, renderedPdfHeight);
        heightLeft -= pdfHeight;
        if (heightLeft > 0) {
          position = -pdfHeight;
          pdf.addPage();
        }
      }

      // Get PDF as a blob
      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], "vaccine-page.pdf", {
        type: "application/pdf",
      });

      pdf.save("vaccine-page.pdf");

      // Now, if a valid infant is available, upload the PDF file
      if (effectiveInfant?.id) {
        try {
          await UploadDocumentToInfant(effectiveInfant.id, pdfFile);
          alert("PDF uploaded successfully.");
        } catch (uploadError) {
          console.error("Error uploading PDF:", uploadError);
        }
      }

      await handleNotify();
    } catch (genError) {
      console.error("Error generating PDF:", genError);
    } finally {
      setIsSaving(false);
    }
  };

  // Extract unique baranggay values from the infants data
  const baranggays = data?.data
    ? [...new Set(data.data.map((infant) => infant.address.baranggay))]
    : [];

  // Filter infants by the selected baranggay
  const filteredInfants = selectedBaranggay
    ? data.data.filter(
        (infant) => infant.address.baranggay === selectedBaranggay
      )
    : [];

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
      <Sidebar />
      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8">
        {/* Save to PDF Button */}
        <button
          onClick={handleSavePDF}
          disabled={isSaving}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isSaving ? "Sending a copy to Parent" : "Send to Parent"}
        </button>

        {/* Render filters only if no infantId param is provided */}
        {!infantId && (
          <>
            {/* Filter: Baranggay Dropdown */}
            <div>
              <label htmlFor="baranggay" className="mr-2">
                Select Baranggay:
              </label>
              <select
                id="baranggay"
                value={selectedBaranggay}
                onChange={(e) => {
                  setSelectedBaranggay(e.target.value);
                  // Reset infant selection when baranggay changes
                  setSelectedInfant(null);
                }}
              >
                <option value="">--Select Baranggay--</option>
                {baranggays.map((bar) => (
                  <option key={bar} value={bar}>
                    {bar}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Infant Dropdown (shows infants of the selected baranggay) */}
            {selectedBaranggay && (
              <div>
                <label htmlFor="infant" className="mr-2">
                  Select Infant:
                </label>
                <select
                  id="infant"
                  value={selectedInfant?.id || ""}
                  onChange={(e) => {
                    const infant = filteredInfants.find(
                      (i) => i.id === e.target.value
                    );
                    setSelectedInfant(infant);
                  }}
                >
                  <option value="">--Select Infant--</option>
                  {filteredInfants.map((infant) => (
                    <option key={infant.id} value={infant.id}>
                      {infant.fullname}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* PDF content container */}
        <div ref={pdfRef}>
          {/* Pass the effectiveInfant (from param or filter) to VaccinePage */}
          <VaccinePage childData={effectiveInfant} />
          <VaccinePage2 />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VaccineDownloadFormPage;
