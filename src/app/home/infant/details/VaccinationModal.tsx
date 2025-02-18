// components/VaccinationModal.tsx
"use client";

import { useState } from "react";
import { formatDate } from "./utils";

// ShadCN UI components – adjust the paths as needed.
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function VaccinationModal({
  isOpen,
  onClose,
  schedules,
  handleUpdate,
  handleNotify,
}: {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schedules: any[];
  handleUpdate: (
    dose: string,
    vaccineId: string | undefined,
    vaccineName: string,
    scheduledDate: string,
    schedId: string | undefined
  ) => void;
  handleNotify: (title: string, body: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-3xl z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Vaccination Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {schedules.map((schedule) => (
            <VaccineScheduleItem
              key={schedule.id}
              schedule={schedule}
              handleUpdate={handleUpdate}
              handleNotify={handleNotify}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VaccineScheduleItem({ schedule, handleUpdate, handleNotify }: any) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-2">
        {schedule.vaccine_names[0]?.vaccine_name}
      </h3>
      <div className="space-y-2">
        {["firstDose", "secondDose", "thirdDose"].map(
          (dose) =>
            schedule[dose] && (
              <DoseStatus
                key={dose}
                dose={dose}
                schedule={schedule}
                handleUpdate={handleUpdate}
                handleNotify={handleNotify}
              />
            )
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DoseStatus({ dose, schedule, handleUpdate, handleNotify }: any) {
  // Local state for the selected date from the calendar.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Local state to control the popover (calendar) open state.
  const [open, setOpen] = useState(false);

  // For display purposes: e.g. "firstDose" becomes "first Dose"
  const doseLabel = dose.replace("Dose", " Dose");
  const status = schedule.Vaccination[0]?.[`${dose}Status`];
  const vaccineName = schedule.vaccine_names[0]?.vaccine_name;
  const scheduledDate = schedule[dose];

  // Keys for the additional fields.
  const updateKey = `Update${dose.charAt(0).toUpperCase() + dose.slice(1)}`;
  const remarkKey = `remark_${dose.charAt(0).toUpperCase() + dose.slice(1)}`;
  const updateDate = schedule[updateKey];
  const remark = schedule[remarkKey];

  // When the user confirms a date, format it as mm-dd-yyyy, call handleUpdate, and close the popover.
  const handleDateConfirm = (date: Date) => {
    // Reset the selected date.
    setSelectedDate(null);
    // Format the date as mm-dd-yyyy.
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    const formattedDate = `${mm}-${dd}-${yyyy}`;

    // Call the update handler.
    handleUpdate(
      `${dose}Status`,
      schedule.Vaccination[0]?.id,
      vaccineName,
      formattedDate,
      schedule?.id
    );
    // Close the popover.
    setOpen(false);
  };

  return (
    <div className="border p-2 rounded-lg mb-2">
      <div className="flex justify-between items-center">
        <span>{doseLabel}:</span>
        <span
          className={`badge ${
            status === "DONE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {formatDate(scheduledDate)} - {status || "PENDING"}
        </span>
        {/* Always show the Update button, but only show Remind if status is not "DONE" */}
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                Update
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate!}
                onSelect={setSelectedDate}
                initialFocus
              />
              <div className="flex justify-end mt-2 gap-2 p-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDate(null);
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedDate && handleDateConfirm(selectedDate)
                  }
                  disabled={!selectedDate}
                >
                  Confirm
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {status !== "DONE" && (
            <Button
              onClick={() =>
                handleNotify(
                  vaccineName,
                  `${doseLabel} - ${formatDate(scheduledDate)}`
                )
              }
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Remind
            </Button>
          )}
        </div>
      </div>

      {/* Display the updated date if it exists */}
      {updateDate && (
        <div className="mt-1 text-sm text-gray-600">
          <span className="font-semibold">Updated: </span>
          {formatDate(updateDate)}
        </div>
      )}

      {/* Display the remark if it exists */}
      {remark && (
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Remark: </span>
          {remark}
        </div>
      )}
    </div>
  );
}
