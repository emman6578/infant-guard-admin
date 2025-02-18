"use client";

import { useCallback, useState } from "react";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import InformationCard from "./InformationCard";
import VaccineChart from "./VaccineChart";
import PredictiveAnalysis from "./PredictiveAnalysis";
import VaccinationModal from "./VaccinationModal";
import { formatDate, getMonthName } from "./utils";
import InfantDoseTimingAnalysis from "./DoseTimingAnalysis";

export default function InfantDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const {
    getOneInfantDetail,
    updateVaccineStatus,
    getPushToken,
    updatVaccineSchedDate,
  } = useProtectedRoutesApi();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["infant", id],
    queryFn: () => getOneInfantDetail(id as string),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateVaccineDoseStatus = useMutation({
    mutationFn: async ({
      id,
      doseType,
      status,
    }: {
      id: string;
      doseType: string;
      status: string;
    }) => {
      console.log("Updating vaccine status with:", { id, doseType, status });
      return updateVaccineStatus(id, doseType, status);
    },
    onSuccess: () => {
      console.log("Vaccine status updated successfully. Invalidating cache...");
      queryClient.invalidateQueries({ queryKey: ["infant", id] });
      queryClient.invalidateQueries({ queryKey: ["infants"] });
    },
    onError: (err) => {
      console.error("Mutation failed:", err);
    },
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
      queryClient.invalidateQueries({ queryKey: ["infant", id] });
      queryClient.invalidateQueries({ queryKey: ["infants"] });
    },
    onError: (err) => {
      console.error("Notification mutation failed:", err);
    },
  });

  const updateVaccineSchedDate = useMutation({
    mutationFn: async ({
      vaccineSchedule_id,
      doseType,
      date,
    }: {
      vaccineSchedule_id: string;
      doseType: string;
      date: string;
    }) => {
      console.log("Updating vaccine status with:", { id, doseType, status });
      return updatVaccineSchedDate(vaccineSchedule_id, doseType, date);
    },
    onSuccess: () => {
      console.log("Vaccine status updated successfully. Invalidating cache...");
      queryClient.invalidateQueries({ queryKey: ["infant", id] });
      queryClient.invalidateQueries({ queryKey: ["infants"] });
    },
    onError: (err) => {
      console.error("Mutation failed:", err);
    },
  });

  const handleUpdate = useCallback(
    async (
      dose: string,
      vaccineId: string | undefined,
      vaccineName: string,
      scheduledDate: string,
      schedId: string | undefined
    ) => {
      if (!vaccineId) {
        console.error("handleUpdate: Vaccine ID is undefined, cannot proceed.");
        return;
      }
      try {
        // Prepare a nice label for the dose (optional)
        let doseLabel;
        let doseDateLabel;
        if (dose === "firstDoseStatus") {
          doseLabel = "1st Dose";
          doseDateLabel = "UpdateFirstDose";
        } else if (dose === "secondDoseStatus") {
          doseLabel = "2nd Dose";
          doseDateLabel = "UpdateSecondDose";
        } else if (dose === "thirdDoseStatus") {
          doseLabel = "3rd Dose";
          doseDateLabel = "UpdateThirdDose";
        } else {
          doseLabel = dose;
          doseDateLabel = dose;
        }

        // Update the vaccine status
        await updateVaccineDoseStatus.mutateAsync({
          id: vaccineId,
          doseType: dose,
          status: "DONE",
        });

        await updateVaccineSchedDate.mutateAsync({
          vaccineSchedule_id: schedId!,
          doseType: doseDateLabel,
          date: scheduledDate,
        });

        console.log(
          "Vaccine status updated successfully, now sending notification..."
        );

        // Build the notification details
        const formattedDate = formatDate(scheduledDate);
        const title = `Baby ${data?.data.fullname} his/her Vaccine Update: ${vaccineName}`;
        const body = `${doseLabel} scheduled for ${formattedDate} is now marked as DONE.`;

        // Send the notification
        await sendNotifyMutation.mutateAsync({
          infant_id: id!,
          title,
          body,
          data: "Vaccine Reminder",
        });
      } catch (error) {
        console.error(
          "handleUpdate: Error updating vaccine status or sending notification:",
          error
        );
      }
    },
    [
      updateVaccineDoseStatus,
      sendNotifyMutation,
      id,
      data,
      updateVaccineSchedDate,
    ]
  );

  const handleNotify = async (title: string, body: string) => {
    try {
      await sendNotifyMutation.mutateAsync({
        infant_id: id!,
        title: `Reminder for baby ${data?.data.fullname} his/her ${title}`,
        body: `was scheduled for: ${body}`,
        data: "Vaccine Reminder",
      });
    } catch (error) {
      console.error("handleNotify: Error sending notification:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const infantData = data?.data;
  const address = infantData?.address;
  const birthday = infantData?.birthday;
  const parent = infantData?.Parent;
  const vaccinationSchedule = infantData?.Vaccination_Schedule;

  // Sort the vaccination schedule array based on the vaccine type code
  const sortedVaccinationSchedule = vaccinationSchedule
    ? [...vaccinationSchedule].sort((a, b) => {
        const codeA = Number(a.vaccine_names[0]?.vaccine_type_code || 0);
        const codeB = Number(b.vaccine_names[0]?.vaccine_type_code || 0);
        return codeA - codeB;
      })
    : [];

  // Prepare data for the chart: for each schedule, extract the vaccine name and overall percentage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = sortedVaccinationSchedule.map((schedule: any) => ({
    vaccine: schedule.vaccine_names[0]?.vaccine_name,
    percentage: schedule.Vaccination[0]?.percentage || 0,
  }));

  const isAllVaccinated = sortedVaccinationSchedule.every((schedule: any) => {
    const frequency = schedule.vaccine_names[0]?.frequency;
    if (frequency === 1) {
      return !!schedule.UpdateFirstDose;
    } else if (frequency === 2) {
      return !!schedule.UpdateFirstDose && !!schedule.UpdateSecondDose;
    } else if (frequency === 3) {
      return (
        !!schedule.UpdateFirstDose &&
        !!schedule.UpdateSecondDose &&
        !!schedule.UpdateThirdDose
      );
    }
    return false;
  });

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
      <Sidebar />

      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8 relative">
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Vaccination Schedule
          </button>
          {isAllVaccinated && (
            <button
              onClick={() =>
                router.push(`/home/about?infantId=${infantData.id}`)
              }
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-3"
            >
              Vaccine Form
            </button>
          )}
        </div>
        <InformationCard title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={infantData.image}
                alt="Infant"
                className="w-32 h-32 rounded-full object-cover mr-4"
              />
              <div>
                <p className="text-xl font-semibold">{infantData.fullname}</p>
                <p className="text-gray-600">{infantData.gender}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Height:</span>{" "}
                {infantData.height} cm
              </p>
              <p>
                <span className="font-semibold">Weight:</span>{" "}
                {infantData.weight} kg
              </p>
              <p>
                <span className="font-semibold">Health Center:</span>{" "}
                {infantData.health_center}
              </p>
              <p>
                <span className="font-semibold">Family Number:</span>{" "}
                {infantData.family_no}
              </p>
            </div>
          </div>
        </InformationCard>
        <InformationCard title="Parent Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <span className="font-semibold">Mothers Name:</span>{" "}
                {infantData.mothers_name}
              </p>
              <p>
                <span className="font-semibold">Fathers Name:</span>{" "}
                {infantData.fathers_name}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Parent Email:</span>{" "}
                {parent?.auth?.email}
              </p>
            </div>
          </div>
        </InformationCard>
        <InformationCard title="Address">
          <p>
            {address?.purok}, {address?.baranggay}, {address?.municipality},{" "}
            {address?.province}
          </p>
        </InformationCard>
        <InformationCard title="Birthday Details">
          <p>
            {getMonthName(birthday?.month)} {birthday?.day}, {birthday?.year}
          </p>
          <p className="mt-2">
            <span className="font-semibold">Place of Birth:</span>{" "}
            {infantData.place_of_birth}
          </p>
        </InformationCard>
        <VaccineChart data={chartData} />
        <PredictiveAnalysis infantData={infantData} />
        {!isLoading && !isError && infantData && (
          <>
            {/* Other components or information cards */}
            <InfantDoseTimingAnalysis infantData={infantData} />
          </>
        )}
        <VaccinationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          schedules={sortedVaccinationSchedule}
          handleUpdate={handleUpdate}
          handleNotify={handleNotify}
        />
      </main>

      <Footer />
    </div>
  );
}
