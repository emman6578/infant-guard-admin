"use client";

import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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
                  <strong>Child’s Name:</strong> {childData.fullname}
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
                  <strong>Mother’s Name:</strong> {childData.mothers_name}
                </p>
                <p>
                  <strong>Father’s Name:</strong> {childData.fathers_name}
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
                const getCombinedRemarks = (schedule: any) => {
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

export default VaccineForm;
