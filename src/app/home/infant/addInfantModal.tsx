"use client";

import React, { useState } from "react";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const AddInfantModal = () => {
  const { createInfant, CreateVaccineProgress, CreateVaccineSchedule } =
    useProtectedRoutesApi();
  const queryClient = useQueryClient();

  // Form state
  const [fullname, setFullname] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  // Use dropdown options for purok from 1-20
  const [purok, setPurok] = useState("");
  const [baranggay, setBaranggay] = useState("");
  // municipality and province have default values and are disabled
  const [municipality] = useState("Ligao City");
  const [province] = useState("Albay");
  const [place_of_birth, setPlaceOfBirth] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [mothers_name, setMothersName] = useState("");
  const [fathers_name, setFathersName] = useState("");
  const [contact_num, setContactNum] = useState("");
  const [health_center, setHealthCenter] = useState("");
  const [family_no, setFamilyNo] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  // "touched" state to track when a user has left a field
  const [touched, setTouched] = useState({
    fullname: false,
    month: false,
    day: false,
    year: false,
    purok: false,
    baranggay: false,
    place_of_birth: false,
    height: false,
    weight: false,
    gender: false,
    mothers_name: false,
    fathers_name: false,
    contact_num: false,
    health_center: false,
    family_no: false,
  });

  // Arrays for dropdown options
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1980 + 1 },
    (_, i) => 1980 + i
  );
  const baranggayOptions = [
    "AMTIC",
    "BAGUMBAYAN",
    "ABELLA",
    "CABARIAN",
    "BALIGANG",
    "BAY",
    "ALLANG",
    "CATBURAWAN",
    "BARAYONG",
    "BINATAGAN",
    "BACONG",
    "MAONON",
    "BASAG",
    "BOBONSURAN",
    "BALANAC",
    "BATANG",
    "BONGA",
    "BUSAC",
    "BINANOWAN",
    "CALZADA",
    "CULLIAT",
    "BUSAY",
    "CAVASI",
    "FRANCIA",
    "HERRERA",
    "DUNAO",
    "MACALIDONG",
    "MAHABA",
    "GUILID",
    "MALAMA",
    "NABONTON",
    "LAYON",
    "OMA-OMA",
    "NASISI",
    "PANDAN",
    "PALAPAS",
    "PAULOG",
    "RANAO-RANAO",
    "PAULBA",
    "PINIT",
    "STA. CRUZ",
    "PINAMANIQUIAN",
    "TAMBO",
    "TAGPO",
    "SAN VICENTE",
    "TINAGO",
    "TANDARURA",
    "TINAMPO",
    "TASTAS",
    "TOMOLIN",
    "TIONGSON",
    "TUBURAN",
    "TULA-TULA GRANDE",
    "TULA-TULA PEQUEÑO",
    "TUPAZ",
  ];
  const familyNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  // Function to clear all form fields and reset touched state
  const clearForm = () => {
    setFullname("");
    setMonth("");
    setDay("");
    setYear("");
    setPurok("");
    setBaranggay("");
    setPlaceOfBirth("");
    setHeight("");
    setGender("");
    setWeight("");
    setMothersName("");
    setFathersName("");
    setContactNum("");
    setHealthCenter("");
    setFamilyNo("");
    setTouched({
      fullname: false,
      month: false,
      day: false,
      year: false,
      purok: false,
      baranggay: false,
      place_of_birth: false,
      height: false,
      weight: false,
      gender: false,
      mothers_name: false,
      fathers_name: false,
      contact_num: false,
      health_center: false,
      family_no: false,
    });
  };

  // Handler to restrict contact number to digits only and max 11 characters
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 11) {
      setContactNum(val);
    }
  };

  // Birthday future-date validation:
  const birthdayWarning = (() => {
    if (month && day && year) {
      const inputDate = new Date(Number(year), Number(month) - 1, Number(day));
      const today = new Date();
      if (inputDate > today) {
        return "Birthdate cannot be in the future";
      }
    }
    return "";
  })();

  // Create a mutation using TanStack Query's useMutation hook
  const createInfantMutation = useMutation({
    mutationFn: (newInfant: {
      fullname: string;
      month: string;
      day: string;
      year: string;
      purok: string;
      baranggay: string;
      municipality: string;
      province: string;
      place_of_birth: string;
      height: string;
      gender: string;
      weight: string;
      mothers_name: string;
      fathers_name: string;
      contact_num: string;
      health_center: string;
      family_no: string;
    }) => {
      // Convert numeric fields to numbers before calling the API
      return createInfant(
        newInfant.fullname,
        Number(newInfant.month),
        Number(newInfant.day),
        Number(newInfant.year),
        newInfant.purok,
        newInfant.baranggay,
        newInfant.municipality,
        newInfant.province,
        newInfant.place_of_birth,
        Number(newInfant.height),
        newInfant.gender,
        Number(newInfant.weight),
        newInfant.mothers_name,
        newInfant.fathers_name,
        newInfant.contact_num,
        newInfant.health_center,
        Number(newInfant.family_no)
      );
    },
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["infants"] });
      clearForm();
      setIsOpen(false);
      const infantId = res?.data?.id;
      try {
        await CreateVaccineSchedule(infantId);
        await CreateVaccineProgress(infantId);
      } catch (error) {
        console.error("Error creating vaccine schedule or progress:", error);
      }
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // Validation errors – errors are only shown for fields that have been "touched"
  const errors = {
    fullname: !fullname && touched.fullname ? "Full name is required" : "",
    month: !month && touched.month ? "Month is required" : "",
    day: !day && touched.day ? "Day is required" : "",
    year: !year && touched.year ? "Year is required" : "",
    purok: !purok && touched.purok ? "Purok is required" : "",
    baranggay: !baranggay && touched.baranggay ? "Baranggay is required" : "",
    place_of_birth:
      !place_of_birth && touched.place_of_birth
        ? "Place of Birth is required"
        : "",
    height: !height && touched.height ? "Height is required" : "",
    weight: !weight && touched.weight ? "Weight is required" : "",
    gender: !gender && touched.gender ? "Gender is required" : "",
    mothers_name:
      !mothers_name && touched.mothers_name ? "Mother's name is required" : "",
    fathers_name:
      !fathers_name && touched.fathers_name ? "Father's name is required" : "",
    contact_num:
      touched.contact_num && contact_num.length !== 11
        ? "Contact number must be exactly 11 digits"
        : "",
    health_center:
      !health_center && touched.health_center
        ? "Health Center is required"
        : "",
    family_no:
      !family_no && touched.family_no ? "Family Number is required" : "",
  };

  // Overall form validity: every required field is nonempty, the contact number is exactly 11 digits,
  // and the birthday is not in the future.
  const isFormValid =
    fullname &&
    month &&
    day &&
    year &&
    purok &&
    baranggay &&
    place_of_birth &&
    height &&
    weight &&
    gender &&
    mothers_name &&
    fathers_name &&
    contact_num.length === 11 &&
    health_center &&
    family_no &&
    !birthdayWarning;

  // Handle form submission by calling the mutation
  const handleSave = () => {
    // Mark all fields as touched so that any errors are shown
    setTouched({
      fullname: true,
      month: true,
      day: true,
      year: true,
      purok: true,
      baranggay: true,
      place_of_birth: true,
      height: true,
      weight: true,
      gender: true,
      mothers_name: true,
      fathers_name: true,
      contact_num: true,
      health_center: true,
      family_no: true,
    });
    if (!isFormValid) {
      return;
    }
    createInfantMutation.mutate({
      fullname,
      month,
      day,
      year,
      purok,
      baranggay,
      municipality,
      province,
      place_of_birth,
      height,
      gender,
      weight,
      mothers_name,
      fathers_name,
      contact_num,
      health_center,
      family_no,
    });
  };

  return (
    <div className="flex justify-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="px-4 py-2">Add Infant</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Infant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Full Name – accepts only letters and spaces */}
            <div className="flex flex-col">
              <label
                htmlFor="fullname"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <Input
                id="fullname"
                value={fullname}
                onChange={(e) =>
                  setFullname(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, fullname: true }))
                }
              />
              {errors.fullname && (
                <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>
              )}
            </div>

            {/* Birth Date: Month, Day, Year Dropdowns */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="month"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Month
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, month: true }))
                  }
                  className="border rounded p-2"
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.month && (
                  <p className="text-red-500 text-sm mt-1">{errors.month}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="day"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Day
                </label>
                <select
                  id="day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, day: true }))}
                  className="border rounded p-2"
                >
                  <option value="">Select Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.day && (
                  <p className="text-red-500 text-sm mt-1">{errors.day}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="year"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Year
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, year: true }))}
                  className="border rounded p-2"
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                )}
              </div>
            </div>
            {/* Warning if the birthday is in the future */}
            {(touched.month || touched.day || touched.year) &&
              birthdayWarning && (
                <p className="text-red-500 text-sm mt-1">{birthdayWarning}</p>
              )}

            {/* Address details */}
            {/* Purok field as a dropdown with values 1-20 */}
            <div className="flex flex-col">
              <label
                htmlFor="purok"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Purok
              </label>
              <select
                id="purok"
                value={purok}
                onChange={(e) => setPurok(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, purok: true }))}
                className="border rounded p-2"
              >
                <option value="">Select Purok</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              {errors.purok && (
                <p className="text-red-500 text-sm mt-1">{errors.purok}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="baranggay"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Baranggay
              </label>
              <select
                id="baranggay"
                value={baranggay}
                onChange={(e) => setBaranggay(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, baranggay: true }))
                }
                className="border rounded p-2"
              >
                <option value="">Select Baranggay</option>
                {baranggayOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.baranggay && (
                <p className="text-red-500 text-sm mt-1">{errors.baranggay}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="municipality"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Municipality
              </label>
              <Input
                id="municipality"
                value={municipality}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="province"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Province
              </label>
              <Input
                id="province"
                value={province}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="place_of_birth"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Place of Birth
              </label>
              <Input
                id="place_of_birth"
                value={place_of_birth}
                onChange={(e) =>
                  setPlaceOfBirth(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, place_of_birth: true }))
                }
              />
              {errors.place_of_birth && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.place_of_birth}
                </p>
              )}
            </div>

            {/* Physical details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="height"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Height
                </label>
                <Input
                  id="height"
                  value={height}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Allow only digits and a single dot.
                    value = value.replace(/[^0-9.]/g, "");
                    const dotIndex = value.indexOf(".");
                    if (dotIndex !== -1) {
                      // Keep only the first dot and remove additional ones.
                      value =
                        value.slice(0, dotIndex + 1) +
                        value.slice(dotIndex + 1).replace(/\./g, "");
                    }
                    setHeight(value);
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, height: true }))
                  }
                  placeholder="cm"
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">{errors.height}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="weight"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Weight
                </label>
                <Input
                  id="weight"
                  value={weight}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Allow only digits and a single dot.
                    value = value.replace(/[^0-9.]/g, "");
                    const dotIndex = value.indexOf(".");
                    if (dotIndex !== -1) {
                      // Keep only the first dot and remove additional ones.
                      value =
                        value.slice(0, dotIndex + 1) +
                        value.slice(dotIndex + 1).replace(/\./g, "");
                    }
                    setWeight(value);
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, weight: true }))
                  }
                  placeholder="kg"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="gender"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, gender: true }))}
                className="border rounded p-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Parent details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="mothers_name"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Mother s Name
                </label>
                <Input
                  id="mothers_name"
                  value={mothers_name}
                  onChange={(e) =>
                    setMothersName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, mothers_name: true }))
                  }
                />
                {errors.mothers_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.mothers_name}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="fathers_name"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Father s Name
                </label>
                <Input
                  id="fathers_name"
                  value={fathers_name}
                  onChange={(e) =>
                    setFathersName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, fathers_name: true }))
                  }
                />
                {errors.fathers_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fathers_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="contact_num"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Contact Number
              </label>
              <Input
                id="contact_num"
                value={contact_num}
                onChange={handleContactChange}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, contact_num: true }))
                }
                maxLength={11}
                placeholder="11 digit number"
              />
              {errors.contact_num && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact_num}
                </p>
              )}
            </div>

            {/* Health and Family details */}
            <div className="flex flex-col">
              <label
                htmlFor="health_center"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Health Center
              </label>
              <Input
                id="health_center"
                value={health_center}
                onChange={(e) =>
                  setHealthCenter(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, health_center: true }))
                }
              />
              {errors.health_center && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.health_center}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="family_no"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Family Number
              </label>
              <select
                id="family_no"
                value={family_no}
                onChange={(e) => setFamilyNo(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, family_no: true }))
                }
                className="border rounded p-2"
              >
                <option value="">Select Family Number</option>
                {familyNumbers.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.family_no && (
                <p className="text-red-500 text-sm mt-1">{errors.family_no}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid || createInfantMutation.isLoading}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddInfantModal;
