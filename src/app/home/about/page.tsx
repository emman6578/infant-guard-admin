"use client";

import React, { useRef, useState } from "react";
import Sidebar from "@/components/sidebar";
import VaccinePage from "./page1";
import VaccinePage2 from "./page2";
import Footer from "@/components/footer";

// Import PDF libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const MainVaccinePage = () => {
  const { infantDataDownload, UploadDocumentToInfant, getPushToken } =
    useProtectedRoutesApi();

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

export default MainVaccinePage;
