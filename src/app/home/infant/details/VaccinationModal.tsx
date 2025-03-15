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

function DoseStatus({ dose, schedule, handleUpdate, handleNotify }: any) {
  // New state for dropdown selections instead of a single Date.
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [selectedDay, setSelectedDay] = useState<number | "">("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  // Local state to control the popover open state.
  const [open, setOpen] = useState(false);

  // Display values.
  const doseLabel = dose.replace("Dose", " Dose");
  const status = schedule.Vaccination[0]?.[`${dose}Status`];
  const vaccineName = schedule.vaccine_names[0]?.vaccine_name;
  const scheduledDate = schedule[dose];

  // Additional fields.
  const updateKey = `Update${dose.charAt(0).toUpperCase() + dose.slice(1)}`;
  const remarkKey = `remark_${dose.charAt(0).toUpperCase() + dose.slice(1)}`;
  const updateDate = schedule[updateKey];
  const remark = schedule[remarkKey];

  // Reused function for handling the update.
  const handleDateConfirm = (date: Date) => {
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
    setOpen(false);
  };

  const handleConfirm = () => {
    if (selectedMonth && selectedDay && selectedYear) {
      const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
      // Reset dropdown states.
      setSelectedMonth("");
      setSelectedDay("");
      setSelectedYear("");
      handleDateConfirm(date);
    }
  };

  const handleCancel = () => {
    setSelectedMonth("");
    setSelectedDay("");
    setSelectedYear("");
    setOpen(false);
  };

  // Dropdown options.
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => 2000 + i);

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
          {/* {updateDate ? <div></div> : formatDate(scheduledDate)} */}

          {updateDate && (
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-semibold">Updated: </span>
              {formatDate(updateDate)}
            </div>
          )}

          {remark && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Remark: </span>
              {remark}
            </div>
          )}
        </span>
        {/* Always show the Update button, with custom dropdowns instead of the calendar */}
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                Update
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="border rounded p-2"
                  >
                    <option value="">Month</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="border rounded p-2"
                  >
                    <option value="">Day</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="border rounded p-2"
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!(selectedMonth && selectedDay && selectedYear)}
                  >
                    Confirm
                  </Button>
                </div>
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
    </div>
  );
}
